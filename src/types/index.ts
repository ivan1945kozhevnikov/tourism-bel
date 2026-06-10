export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  history: string;
  latitude: number;
  longitude: number;
  category: string;
  image_url: string;
  audio_url?: string;
  created_at?: string;
}

export interface Tour {
  id: number;
  title: string;
  description: string;
  duration: string;
  price: number;
  image_url: string;
  max_participants: number;
  available_dates?: string[];
  is_active: boolean;
  included?: string;
  not_included?: string;
  schedule?: string;
  route_points?: string;
  created_at?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  tour_id: number;
  tour_title?: string;
  tour_image?: string;
  booking_date: string;
  participants: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at?: string;
}

export interface Tradition {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  created_at?: string;
}

export interface Food {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  recipe: string;
  category: string;
  image_url: string;
  created_at?: string;
}

export interface Legend {
  id: number;
  title: string;
  content: string;
  origin: string;
  category: string;
  image_url: string;
  created_at?: string;
}

export interface Feedback {
  id: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  subject: string;
  message: string;
  status: 'new' | 'responded';
  admin_response?: string;
  created_at?: string;
  responded_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
