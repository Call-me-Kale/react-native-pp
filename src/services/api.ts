import { z } from 'zod';
import { 
  LoginResponseSchema, 
  TrainingEntrySchema, 
  TrainingEntryListSchema,
  TrainingStatsSchema,
  EquipmentSchema,
  EquipmentListSchema,
  EquipmentLogListSchema,
  EquipmentLogSchema,
  StreakDataSchema,
  UserSchema,
  TrainingDayInfoSchema,
  EquipmentUsageStatsSchema,
  StreakRangeSchema
} from './schemas';

// API Configuration
// For local development on Android emulator use 'http://10.0.2.2:5204'
// For iOS simulator or web use 'http://localhost:5204'
const BASE_URL = 'http://localhost:5204';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
}

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type TrainingEntry = z.infer<typeof TrainingEntrySchema>;
export type EquipmentUsageStats = z.infer<typeof EquipmentUsageStatsSchema>;
export type TrainingDayInfo = z.infer<typeof TrainingDayInfoSchema>;
export type TrainingStats = z.infer<typeof TrainingStatsSchema>;
export type Equipment = z.infer<typeof EquipmentSchema>;
export type EquipmentLog = z.infer<typeof EquipmentLogSchema>;
export type StreakRange = z.infer<typeof StreakRangeSchema>;
export type StreakData = z.infer<typeof StreakDataSchema>;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Helper to get the full URL. 
   * Prepends /api for core modules as per specification.
   */
  private getUrl(path: string, isCoreModule: boolean = true): string {
    const prefix = isCoreModule ? '/api' : '';
    return `${BASE_URL}${prefix}${path}`;
  }

  private async handleResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    
    if (schema) {
      try {
        const validatedData = schema.parse(data);
        console.log('API Validation Success:', {
          path: response.url.split('/api').pop() || response.url,
          data: validatedData
        });
        return validatedData;
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('API Validation Error:', error.issues);
          console.error('Data that failed validation:', data);
        }
        throw error;
      }
    }
    
    return data as T;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(this.getUrl('/auth/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response, LoginResponseSchema);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(this.getUrl('/auth/register'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response, LoginResponseSchema);
  }

  async logout(): Promise<void> {
    try {
      await fetch(this.getUrl('/auth/logout'), {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    const response = await fetch(this.getUrl('/auth/change-password'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse(response);
  }

  // Training entries
  async getTrainingEntries(type?: string, limit?: number): Promise<TrainingEntry[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = this.getUrl(`/trainings${queryString ? `?${queryString}` : ''}`, true);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, TrainingEntryListSchema);
  }

  async getTrainingById(id: string): Promise<TrainingEntry> {
    const url = this.getUrl(`/trainings/${id}`, true);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, TrainingEntrySchema);
  }

  async createTrainingEntry(entry: Omit<TrainingEntry, 'id'>): Promise<TrainingEntry> {
    const response = await fetch(this.getUrl('/trainings'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    return this.handleResponse(response, TrainingEntrySchema);
  }

  async deleteTrainingEntry(id: string): Promise<void> {
    const response = await fetch(this.getUrl(`/trainings/${id}`, true), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
  }

  async updateTrainingEntry(id: string, entry: Partial<TrainingEntry>): Promise<TrainingEntry> {
    const response = await fetch(this.getUrl(`/trainings/${id}`, true), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    return this.handleResponse(response, TrainingEntrySchema);
  }

  // Stats
  async getTrainingStats(): Promise<TrainingStats> {
    const response = await fetch(this.getUrl('/stats/summary'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    const summary = (await this.handleResponse<any>(response)) || {};
    
    const breakdownResponse = await fetch(this.getUrl('/stats/breakdown'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const breakdown = (await this.handleResponse<any[]>(breakdownResponse)) || [];

    const heartRateResponse = await fetch(this.getUrl('/stats/heart-rate'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const heartRate = (await this.handleResponse<any>(heartRateResponse)) || {};

    // Handle both camelCase and PascalCase from backend
    const totalDistance = summary.totalDistance ?? summary.TotalDistance ?? 0;
    const totalCalories = summary.totalCalories ?? summary.TotalCalories ?? 0;
    const totalDuration = summary.totalDuration ?? summary.TotalDuration ?? 0;
    
    const today = summary.today ?? summary.Today;
    const todayDistance = today?.distance ?? today?.Distance ?? 0;
    const todayCalories = today?.calories ?? today?.Calories ?? 0;

    const averageHeartRate = heartRate.averageOverall ?? heartRate.AverageOverall ?? 0;

    const findCount = (type: string) => {
      const item = breakdown.find(b => (b.type || b.Type || '').toLowerCase() === type.toLowerCase());
      return item?.count ?? item?.Count ?? 0;
    };

    const stats: TrainingStats = {
      totalDistance,
      totalCalories,
      totalDuration,
      todayDistance,
      todayCalories,
      averageHeartRate,
      trainingsByType: {
        swimming: findCount('swimming'),
        cycling: findCount('cycling'),
        running: findCount('running'),
      },
      equipmentUsage: (summary.equipmentUsage ?? summary.EquipmentUsage ?? []).map((e: any) => ({
        id: e.id ?? e.Id,
        name: e.name ?? e.Name,
        category: e.category ?? e.Category,
        totalDistance: e.totalDistance ?? e.TotalDistance,
        trainingCount: e.trainingCount ?? e.TrainingCount,
        maxDistance: e.maxDistance ?? e.MaxDistance,
        wearPercentage: e.wearPercentage ?? e.WearPercentage,
        distanceSinceService: e.distanceSinceService ?? e.DistanceSinceService ?? 0,
      })),
      trainingDates: (summary.trainingDates ?? summary.TrainingDates ?? []).map((d: any) => {
        if (typeof d === 'string') {
          return { date: d, disciplines: [] };
        }
        return {
          date: d.date ?? d.Date ?? '',
          disciplines: d.disciplines ?? d.Disciplines ?? []
        };
      }),
    };

    return TrainingStatsSchema.parse(stats);
  }

  async getStreak(): Promise<StreakData> {
    const response = await fetch(this.getUrl('/stats/streak'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, StreakDataSchema);
  }

  // Equipment (isCoreModule: false as per specification)
  async getEquipment(): Promise<Equipment[]> {
    const response = await fetch(this.getUrl('/Equipment', false), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, EquipmentListSchema);
  }

  async getEquipmentById(id: string): Promise<Equipment> {
    const response = await fetch(this.getUrl(`/Equipment/${id}`, false), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, EquipmentSchema);
  }

  async createEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    const response = await fetch(this.getUrl('/Equipment', false), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(equipment),
    });
    return this.handleResponse(response, EquipmentSchema);
  }

  async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await fetch(this.getUrl(`/Equipment/${id}`, false), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(equipment),
    });
    return this.handleResponse(response, EquipmentSchema);
  }

  async deleteEquipment(id: string): Promise<void> {
    const response = await fetch(this.getUrl(`/Equipment/${id}`, false), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to delete equipment: ${response.status}`);
    }
  }

  async resetService(id: string): Promise<any> {
    const response = await fetch(this.getUrl(`/Equipment/${id}/reset-service`, false), {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getEquipmentLogs(id: string): Promise<EquipmentLog[]> {
    const response = await fetch(this.getUrl(`/Equipment/${id}/logs`, false), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response, EquipmentLogListSchema);
  }

  async addEquipmentLog(id: string, log: Omit<EquipmentLog, 'id' | 'equipmentId'>): Promise<EquipmentLog> {
    const response = await fetch(this.getUrl(`/Equipment/${id}/logs`, false), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(log),
    });
    return this.handleResponse(response, EquipmentLogSchema);
  }
}

export const apiService = new ApiService();
