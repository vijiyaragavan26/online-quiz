import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return 'http://localhost:5005/api';
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      if (localStorage.getItem('qm_token')) {
        localStorage.removeItem('qm_token');
        localStorage.removeItem('qm_user');
        window.dispatchEvent(new Event('auth-change'));
      }
    }
    return Promise.reject(error);
  }
);

// API Service Endpoints
export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
  updateProfile: async (userData) => {
    const res = await api.put('/auth/profile', userData);
    return res.data;
  }
};

export const quizService = {
  getQuizzes: async (params = {}) => {
    const res = await api.get('/quizzes', { params });
    return res.data;
  },
  getQuizById: async (id) => {
    const res = await api.get(`/quizzes/${id}`);
    return res.data;
  },
  createQuiz: async (quizData) => {
    const res = await api.post('/quizzes', quizData);
    return res.data;
  },
  updateQuiz: async (id, quizData) => {
    const res = await api.put(`/quizzes/${id}`, quizData);
    return res.data;
  },
  deleteQuiz: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  }
};

export const attemptService = {
  startAttempt: async (quizId) => {
    const res = await api.post('/attempts/start', { quizId });
    return res.data;
  },
  submitAttempt: async (attemptId, submissionData) => {
    const res = await api.post(`/attempts/${attemptId}/submit`, submissionData);
    return res.data;
  },
  getMyAttempts: async () => {
    const res = await api.get('/attempts/my-attempts');
    return res.data;
  },
  getResults: async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}/results`);
    return res.data;
  }
};

export const dashboardService = {
  getUserStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
  getMyQuizzes: async () => {
    const res = await api.get('/dashboard/my-quizzes');
    return res.data;
  },
  getPlatformStats: async () => {
    const res = await api.get('/dashboard/platform-stats');
    return res.data;
  }
};

export default api;
