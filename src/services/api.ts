// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Update when API is ready

export interface LoginRequest {
  username: string;
  password: string;
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

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // TODO: Replace with real API call when API is ready
    // For now, mock implementation with admin/admin credentials
    
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          username: credentials.username,
          email: 'admin@triathlon.app',
        },
      };
    }

    throw new Error('Invalid credentials');
  }

  async logout(): Promise<void> {
    // TODO: Call logout endpoint when API is ready
    this.clearToken();
  }

  // Training entries
  async getTrainingEntries(): Promise<TrainingEntry[]> {
    // TODO: Replace with real API call
    return [];
  }

  async createTrainingEntry(entry: Omit<TrainingEntry, 'id'>): Promise<TrainingEntry> {
    // TODO: Replace with real API call
    return {
      id: Date.now().toString(),
      ...entry,
    };
  }

  async updateTrainingEntry(id: string, entry: Partial<TrainingEntry>): Promise<TrainingEntry> {
    // TODO: Replace with real API call
    return {
      id,
      type: 'running',
      date: new Date().toISOString(),
      duration: 0,
      distance: 0,
      calories: 0,
      avgHeartRate: 0,
      ...entry,
    };
  }

  async deleteTrainingEntry(id: string): Promise<void> {
    // TODO: Replace with real API call
  }

  // Stats
  async getTrainingStats(): Promise<TrainingStats> {
    // TODO: Replace with real API call
    return {
      totalDistance: 124.5,
      totalCalories: 4520,
      totalDuration: 480,
      averageHeartRate: 142,
      trainingsByType: {
        swimming: 30,
        cycling: 45,
        running: 55,
      },
    };
  }
}

export const apiService = new ApiService();
