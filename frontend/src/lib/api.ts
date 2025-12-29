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
  id: string;
  email: string;
  username: string;
  role: string;
  experience: string;
  time_commitment: string;
  socials?: Record<string, string>;
  tech_tags?: string[];
  project_links?: { name: string; link: string }[];
  created_at?: string;
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
  time_commitment?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface ProjectResponse {
  message: string;
  project: Project;
}

export interface Match {
  id: string;
  type: 'successful' | 'approved';
  project: {
    id: string;
    title: string;
    description: string;
    tags?: string[];
    looking_for?: string[];
  };
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
    experience?: string;
    time_commitment?: string;
    socials?: Record<string, string>;
    tech_tags?: string[];
  };
  created_at: string;
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
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'email' | 'created_at'>): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async checkUsername(username: string): Promise<{ available: boolean }> {
    return this.request<{ available: boolean }>(`/users/check-username/${username}`, {
      method: 'GET',
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

  async deleteProject(projectId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async updateProject(projectId: string, project: Partial<Project>): Promise<ProjectResponse> {
    return this.request<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>('/health');
  }
}

export const apiService = new ApiService(API_BASE_URL);

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  // Check if token exists and throw error early if not
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('No token provided. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Unknown error';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      } catch (textError) {
        errorMessage = `HTTP ${response.status} ${response.statusText}`;
      }
    }
    console.error(`API error for ${endpoint}:`, errorMessage);
    throw new Error(errorMessage);
  }

  return response.json();
};

export const checkUsername = async (username: string) => {
  return apiService.checkUsername(username);
};

// Get next project for user swiping
export const getNextProject = async (userId: string) => {
  return apiRequest(`/swipes/next-project?userId=${userId}`);
};

// Record user's swipe on a project
export const recordProjectSwipe = async (userId: string, projectId: string, direction: 'like' | 'pass') => {
  return apiRequest('/swipes/project', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      project_id: projectId,
      direction,
    }),
  });
};

// Get matches for a user (swipe matches)
export const getSwipeMatches = async (userId: string) => {
  return apiRequest(`/swipes/matches?userId=${userId}`);
};

// Health check for swipes
export const checkSwipesHealth = async () => {
  return apiRequest('/swipes/health');
};

// Get next user for project owner swiping
export const getNextUser = async (projectId: string) => {
  return apiRequest(`/swipes/next-user?projectId=${projectId}`);
};

// Record project owner's swipe on a user
export const recordUserSwipe = async (userId: string, projectId: string, direction: 'like' | 'pass') => {
  return apiRequest('/swipes/user', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      project_id: projectId,
      direction,
    }),
  });
};

// Apply to a project
export const applyToProject = async (projectId: string) => {
  return apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify({
      project_id: projectId,
    }),
  });
};

// Apply to a project from the Projects page
export const applyToProjectBoard = applyToProject;

// Get all active projects
export const getAllProjects = async (page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const queryString = params.toString();
  return apiRequest(`/projects${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
  });
};

export const getFilteredProjects = async (filters: {
  search?: string;
  role?: string[];
  experience?: string[];
  time_commitment?: string[];
  page?: number;
  limit?: number;
}) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.append("search", filters.search.trim());
  if (filters.role?.length) params.append("looking_for", filters.role.join(","));
  if (filters.experience?.length) params.append("experience", filters.experience.join(","));
  if (filters.time_commitment?.length)
    params.append("time_commitment", filters.time_commitment.join(","));
  if (filters.page !== undefined) params.append("page", filters.page.toString());
  if (filters.limit !== undefined) params.append("limit", filters.limit.toString());

  return apiRequest(`/projects?${params.toString()}`, { method: "GET" });
};

// Create a new project
export const createProject = async (projectData: {
  title: string;
  description?: string;
  tags?: string[];
  looking_for?: string[];
  time_commitment?: string;
}) => {
  return apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
};

// Get all projects
export const getProjects = async () => {
  return apiRequest('/projects');
};

// Get matches (both successful and approved applications)
export const getMatches = async (): Promise<{
  matches: Match[];
  count: number;
  successful_count: number;
  approved_count: number;
}> => {
  return apiRequest('/applications/matches');
};

// Get successful applications (where user was accepted to projects)
export const getSuccessfulApplications = async () => {
  return apiRequest('/applications/successful');
};

// Get received requests (applications to user's projects)
export const getReceivedRequests = async () => {
  return apiRequest('/applications/received');
};

// Get user's projects
export const getMyProjects = async () => {
  return apiRequest('/projects/my/projects');
};

// Approve an application
export const approveApplication = async (applicationId: string) => {
  return apiRequest(`/applications/${applicationId}/approve`, {
    method: 'POST',
  });
};

// Reject an application
export const rejectApplication = async (applicationId: string) => {
  return apiRequest(`/applications/${applicationId}/reject`, {
    method: 'DELETE',
  });
};

// Delete a project
export const deleteProject = async (projectId: string) => {
  return apiRequest(`/projects/${projectId}`, {
    method: 'DELETE',
  });
};

export const updateProject = async (projectId: string, projectData: any) => {
  return apiRequest(`/projects/${projectId}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  });
};

