// API Configuration
// For local development on Android emulator use 'http://10.0.2.2:5204/api'
// For iOS simulator or web use 'http://localhost:5204/api'
const API_BASE_URL = 'http://localhost:5204/api';

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
  date: string;
  duration: number; // in minutes
  distance: number; // in km
  calories: number;
  avgHeartRate: number;
  notes?: string;
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

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<LoginResponse>(response);
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Training entries
  async getTrainingEntries(type?: string, limit?: number): Promise<TrainingEntry[]> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/trainings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse<TrainingEntry[]>(response);
  }

  async createTrainingEntry(entry: Omit<TrainingEntry, 'id'>): Promise<TrainingEntry> {
    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    return this.handleResponse<TrainingEntry>(response);
  }

  async updateTrainingEntry(id: string, entry: Partial<TrainingEntry>): Promise<TrainingEntry> {
    const response = await fetch(`${API_BASE_URL}/trainings/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(entry),
    });
    return this.handleResponse<TrainingEntry>(response);
  }

  async deleteTrainingEntry(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/trainings/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete training: ${response.status}`);
    }
  }

  // Stats
  async getTrainingStats(): Promise<TrainingStats> {
    const response = await fetch(`${API_BASE_URL}/stats/summary`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    const summary = await this.handleResponse<any>(response);
    
    const breakdownResponse = await fetch(`${API_BASE_URL}/stats/breakdown`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const breakdown = await this.handleResponse<any[]>(breakdownResponse);

    const heartRateResponse = await fetch(`${API_BASE_URL}/stats/heart-rate`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    const heartRate = await this.handleResponse<any>(heartRateResponse);

    // Handle both camelCase and PascalCase from backend
    const totalDistance = summary.totalDistance ?? summary.TotalDistance ?? 0;
    const totalCalories = summary.totalCalories ?? summary.TotalCalories ?? 0;
    const totalDuration = summary.totalDuration ?? summary.TotalDuration ?? 0;
    
    const today = summary.today ?? summary.Today;
    const todayDistance = today?.distance ?? today?.Distance ?? 0;
    const todayCalories = today?.calories ?? today?.Calories ?? 0;

    const averageHeartRate = heartRate.averageOverall ?? heartRate.AverageOverall ?? 0;

    return {
      totalDistance,
      totalCalories,
      totalDuration,
      todayDistance,
      todayCalories,
      averageHeartRate,
      trainingsByType: {
        swimming: breakdown.find(b => (b.type || b.Type).toLowerCase() === 'swimming')?.count || breakdown.find(b => (b.type || b.Type).toLowerCase() === 'swimming')?.Count || 0,
        cycling: breakdown.find(b => (b.type || b.Type).toLowerCase() === 'cycling')?.count || breakdown.find(b => (b.type || b.Type).toLowerCase() === 'cycling')?.Count || 0,
        running: breakdown.find(b => (b.type || b.Type).toLowerCase() === 'running')?.count || breakdown.find(b => (b.type || b.Type).toLowerCase() === 'running')?.Count || 0,
      },
    };
  }
}

export const apiService = new ApiService();
