import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Users API (для администратора)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  updateRole: (id: number, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  toggleBlock: (id: number) => api.patch(`/users/${id}/toggle-block`),
  delete: (id: number) => api.delete(`/users/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/users/count'),
  getAdminsCount: () => api.get('/users/admins/count'),
};

// Places API
export const placesAPI = {
  getAll: () => api.get('/places'),
  getById: (id: number) => api.get(`/places/${id}`),
  create: (data: any) => api.post('/places', data),
  update: (id: number, data: any) => api.put(`/places/${id}`, data),
  delete: (id: number) => api.delete(`/places/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/places/count'),
  getUnescoCount: () => api.get('/places/unesco/count'),
  getUnescoList: () => api.get('/places?unesco=true'),
};

// Tours API
export const toursAPI = {
  getAll: () => api.get('/tours'),
  getById: (id: number) => api.get(`/tours/${id}`),
  create: (data: any) => api.post('/tours', data),
  update: (id: number, data: any) => api.put(`/tours/${id}`, data),
  delete: (id: number) => api.delete(`/tours/${id}`),
  // Добавленный метод для статистики
  getCount: () => api.get('/tours/count'),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  getAll: () => api.get('/bookings'),
  create: (data: {
    tourId: number;
    bookingDate: string;
    participants: number;
    departureLocation?: string;
  }) => api.post('/bookings', data),
  updateStatus: (id: number, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  cancel: (id: number) => api.delete(`/bookings/${id}`),
  // Добавленный метод для статистики
  getCount: () => api.get('/bookings/count'),
  getTotalTourists: () => api.get('/bookings/total-tourists'),
};

// Traditions API
export const traditionsAPI = {
  getAll: () => api.get('/traditions'),
  getById: (id: number) => api.get(`/traditions/${id}`),
  create: (data: any) => api.post('/traditions', data),
  update: (id: number, data: any) => api.put(`/traditions/${id}`, data),
  delete: (id: number) => api.delete(`/traditions/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/traditions/count'),
};

// Foods API
export const foodsAPI = {
  getAll: () => api.get('/foods'),
  getById: (id: number) => api.get(`/foods/${id}`),
  create: (data: any) => api.post('/foods', data),
  update: (id: number, data: any) => api.put(`/foods/${id}`, data),
  delete: (id: number) => api.delete(`/foods/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/foods/count'),
};

// Legends API с полями latitude и longitude
export const legendsAPI = {
  getAll: () => api.get('/legends'),
  getById: (id: number) => api.get(`/legends/${id}`),
  create: (data: {
    title: string;
    content: string;
    origin: string;
    category: string;
    image_url?: string;
    latitude?: number;
    longitude?: number;
  }) => api.post('/legends', data),
  update: (
    id: number,
    data: {
      title?: string;
      content?: string;
      origin?: string;
      category?: string;
      image_url?: string;
      latitude?: number;
      longitude?: number;
    },
  ) => api.put(`/legends/${id}`, data),
  delete: (id: number) => api.delete(`/legends/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/legends/count'),
  getByCategory: (category: string) => api.get(`/legends?category=${category}`),
  getCountByCategory: (category: string) =>
    api.get(`/legends/count?category=${category}`),
};

// Feedback API
export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  getMyFeedback: () => api.get('/feedback/my'),
  create: (data: {
    user_id?: number;
    user_name?: string;
    user_email?: string;
    subject: string;
    message: string;
  }) => api.post('/feedback', data),
  respond: (id: number, admin_response: string) =>
    api.put(`/feedback/${id}/response`, { admin_response }),
  updateStatus: (id: number, status: string) =>
    api.put(`/feedback/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/feedback/${id}`),
  // Добавленный метод для статистики
  getCount: () => api.get('/feedback/count'),
};

// Reviews API
export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  getTopRated: (limit: number = 6) => api.get(`/reviews/top?limit=${limit}`),
  create: (data: {
    user_name: string;
    rating: number;
    text: string;
    user_email?: string;
  }) => api.post('/reviews', data),
  updateStatus: (
    id: number,
    data: { is_approved: boolean; is_featured: boolean },
  ) => api.patch(`/reviews/${id}/status`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
  // Добавленные методы для статистики
  getCount: () => api.get('/reviews/count'),
  getTotalTourists: () => api.get('/reviews/total-tourists'),
  getApprovedCount: () => api.get('/reviews/approved/count'),
};

// API для статистики главной страницы
export const statsAPI = {
  getHomeStats: () => api.get('/stats/home'),
  getLandmarksCount: () => api.get('/stats/landmarks/count'),
  getCastlesCount: () => api.get('/stats/castles/count'),
  getUnescoCount: () => api.get('/stats/unesco/count'),
  getTouristsCount: () => api.get('/stats/tourists/count'),
};

export default api;
