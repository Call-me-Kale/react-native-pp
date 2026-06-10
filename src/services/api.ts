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

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email?: string;
  };
}

export interface TrainingEntry {
  id: string;
  type: 'swimming' | 'cycling' | 'running';
  title?: string;
  date: string; // ISO8601 String
  duration: number; // in minutes
  distance: number; // in km
  calories: number;
  avgHeartRate: number;
  notes?: string;
  equipmentId?: string;
}

export interface EquipmentUsageStats {
  id: string;
  name: string;
  category: string;
  totalDistance: number;
  trainingCount: number;
  maxDistance: number;
  wearPercentage: number;
  distanceSinceService: number; // New field
}

export interface TrainingDayInfo {
  date: string;
  disciplines: string[];
}

export interface TrainingStats {
  totalDistance: number;
  totalCalories: number;
  totalDuration: number; // in minutes
  todayDistance: number;
  todayCalories: number;
  averageHeartRate: number;
  trainingsByType: {
    swimming: number;
    cycling: number;
    running: number;
  };
  equipmentUsage: EquipmentUsageStats[];
  trainingDates: TrainingDayInfo[];
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  purchaseDate: string;
  notes?: string;
  totalDistance: number;
  lastServiceDistance: number; // New field
  serviceInterval: number; // New field
}

export interface EquipmentLog {
  id: string;
  equipmentId: string;
  description: string;
  distance: number;
  date: string;
}

export interface StreakRange {
  startDate: string;
  endDate: string;
  days: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  streakDates: string[];
  ranges: StreakRange[];
}

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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(this.getUrl('/auth/login'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(this.getUrl('/auth/register'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<LoginResponse>(response);
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
    return this.handleResponse<TrainingEntry[]>(response);
  }

  async getTrainingById(id: string): Promise<TrainingEntry> {
    const url = this.getUrl(`/trainings/${id}`, true);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<TrainingEntry>(response);
  }

  async createTrainingEntry(entry: Omit<TrainingEntry, 'id'>): Promise<TrainingEntry> {
    const response = await fetch(this.getUrl('/trainings'), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    return this.handleResponse<TrainingEntry>(response);
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
    return this.handleResponse<TrainingEntry>(response);
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

    return {
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
  }

  async getStreak(): Promise<StreakData> {
    const response = await fetch(this.getUrl('/stats/streak'), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<StreakData>(response);
  }

  // Equipment (isCoreModule: false as per specification)
  async getEquipment(): Promise<Equipment[]> {
    const response = await fetch(this.getUrl('/Equipment', false), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Equipment[]>(response);
  }

  async getEquipmentById(id: string): Promise<Equipment> {
    const response = await fetch(this.getUrl(`/Equipment/${id}`, false), {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<Equipment>(response);
  }

  async createEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    const response = await fetch(this.getUrl('/Equipment', false), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(equipment),
    });
    return this.handleResponse<Equipment>(response);
  }

  async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
    const response = await fetch(this.getUrl(`/Equipment/${id}`, false), {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(equipment),
    });
    return this.handleResponse<Equipment>(response);
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
    return this.handleResponse<EquipmentLog[]>(response);
  }

  async addEquipmentLog(id: string, log: Omit<EquipmentLog, 'id' | 'equipmentId'>): Promise<EquipmentLog> {
    const response = await fetch(this.getUrl(`/Equipment/${id}/logs`, false), {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(log),
    });
    return this.handleResponse<EquipmentLog>(response);
  }
}

export const apiService = new ApiService();

