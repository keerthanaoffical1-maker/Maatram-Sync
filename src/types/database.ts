export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'student' | 'office' | 'admin';
export type AccountStatus = 'Active' | 'Inactive';
export type AvailabilityStatus = 'available' | 'unavailable' | 'tentative';
export type EventMode = 'Online' | 'Offline';
export type EventStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          institution_id: string | null;
          academic_year: string | null;
          department: string | null;
          student_id: string | null;
          account_status: AccountStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          role?: UserRole;
          institution_id?: string | null;
          academic_year?: string | null;
          department?: string | null;
          student_id?: string | null;
          account_status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          role?: UserRole;
          institution_id?: string | null;
          academic_year?: string | null;
          department?: string | null;
          student_id?: string | null;
          account_status?: AccountStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      institutions: {
        Row: {
          id: string;
          institution_name: string;
          institution_code: string;
          location: string;
          contact_details: Json;
          status: 'Active' | 'Inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_name: string;
          institution_code: string;
          location: string;
          contact_details?: Json;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_name?: string;
          institution_code?: string;
          location?: string;
          contact_details?: Json;
          status?: 'Active' | 'Inactive';
          created_at?: string;
        };
      };
      availability_entries: {
        Row: {
          id: string;
          student_id: string;
          date: string;
          start_time: string;
          end_time: string;
          availability_status: AvailabilityStatus;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          date: string;
          start_time: string;
          end_time: string;
          availability_status: AvailabilityStatus;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          availability_status?: AvailabilityStatus;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: string;
          event_mode: EventMode;
          location: string | null;
          start_datetime: string;
          end_datetime: string;
          target_institutions: string[];
          target_academic_years: string[];
          required_participants: number;
          created_by: string | null;
          status: EventStatus;
          mentor_name: string | null;
          meeting_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          event_mode: EventMode;
          location?: string | null;
          start_datetime: string;
          end_datetime: string;
          target_institutions?: string[];
          target_academic_years?: string[];
          required_participants?: number;
          created_by?: string | null;
          status?: EventStatus;
          mentor_name?: string | null;
          meeting_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          event_mode?: EventMode;
          location?: string | null;
          start_datetime?: string;
          end_datetime?: string;
          target_institutions?: string[];
          target_academic_years?: string[];
          required_participants?: number;
          created_by?: string | null;
          status?: EventStatus;
          mentor_name?: string | null;
          meeting_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
