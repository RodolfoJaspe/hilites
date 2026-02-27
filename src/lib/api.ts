import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Match, Highlight } from '@/types/match';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`API request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('API request failed:', error.message);
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Matches API
export const matchesApi = {
  getMatches: async (params?: {
    date?: string;
    date_from?: string;
    date_to?: string;
    competition_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get('/matches', { params });
    return response.data;
  },

  getMatchById: async (id: string) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
};

// YouTube API
export const youtubeApi = {
  searchVideos: async (params: {
    home_team: string;
    away_team: string;
    match_date?: string;
  }) => {
    const response = await api.get('/youtube', { params });
    return response.data;
  },
};

// AI Discovery API (for future use)
export const aiDiscoveryApi = {
  getHighlights: async (matchId: string) => {
    const response = await api.get(`/ai-discovery/highlights/${matchId}`);
    return response.data;
  },

  discoverHighlights: async (matchId: string) => {
    const response = await api.post('/ai-discovery/process', { matchId });
    return response.data;
  },
};

export default api;
