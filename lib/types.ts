export type UserRole = "artisan" | "client" | "admin";

export type JobStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "in_progress"
  | "completed"
  | "disputed";

export type PaymentStatus = "unpaid" | "escrowed" | "released" | "refunded";

// ------------------------------------------------------------------
// Database row types
// ------------------------------------------------------------------

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  skills: string[];
  bio: string | null;
  hourly_rate: number | null;
  location: string | null;
  is_available: boolean;
  is_approved: boolean;
  rating: number;
  total_reviews: number;
  documents: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined from profiles table
  profiles?: Profile;
}

export interface Job {
  id: string;
  client_id: string;
  artisan_id: string;
  title: string;
  description: string;
  budget: number;
  status: JobStatus;
  payment_status: PaymentStatus;
  completion_proof: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  client?: Profile;
  artisan?: Profile;
  artisan_profile?: ArtisanProfile;
}

export interface Message {
  id: string;
  job_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: Profile;
}

export interface Review {
  id: string;
  job_id: string;
  client_id: string;
  artisan_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  job_id: string | null;
  created_at: string;
}

// ------------------------------------------------------------------
// Form input types
// ------------------------------------------------------------------

export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
  role: "artisan" | "client";
  phone?: string;
}

export interface ArtisanProfileFormData {
  skills: string[];
  bio: string;
  hourly_rate: number;
  location: string;
}

export interface CreateJobFormData {
  artisan_id: string;
  title: string;
  description: string;
  budget: number;
}
