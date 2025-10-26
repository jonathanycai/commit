const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    token_type: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  username: string;
  role: string;
  experience: string;
  time_commitment: string;
  socials?: Record<string, string>;
  tech_tags?: string[];
}

export interface UserProfileResponse {
  message: string;
  profile: UserProfile;
}

export interface Project {
  id?: string;
  owner_id?: string;
  title: string;
  project_name?: string;
  description?: string;
  tags?: string[];
  looking_for?: string[];
  is_active?: boolean;
  created_at?: string;
}

export interface ProjectResponse {
  message: string;
  project: Project;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async checkPasswordStrength(password: string): Promise<{ score: number; feedback: string }> {
    return this.request<{ score: number; feedback: string }>('/auth/check-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // User profile methods
  async createUserProfile(profile: UserProfile): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getUserProfile(userId?: string): Promise<{ profile: UserProfile }> {
    const endpoint = userId ? `/users/${userId}` : '/users/profile';
    return this.request<{ profile: UserProfile }>(endpoint, {
      method: 'GET',
    });
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Project methods
  async createProject(project: Project): Promise<ProjectResponse> {
    return this.request<ProjectResponse>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);
