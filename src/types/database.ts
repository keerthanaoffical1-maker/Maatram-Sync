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
export type InvitationResponseStatus = 'Pending' | 'Accepted' | 'Declined';

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
          group_id: string | null;
          student_id: string | null;
          account_status: AccountStatus;
          skills: string[] | null;
          bio: string | null;
          linkedin_url: string | null;
          github_url: string | null;
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
          group_id?: string | null;
          student_id?: string | null;
          account_status?: AccountStatus;
          skills?: string[] | null;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
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
          group_id?: string | null;
          student_id?: string | null;
          account_status?: AccountStatus;
          skills?: string[] | null;
          bio?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
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
      student_groups: {
        Row: {
          id: string;
          group_name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_name?: string;
          description?: string | null;
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
          target_groups: string[];
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
          target_groups?: string[];
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
          target_groups?: string[];
          required_participants?: number;
          created_by?: string | null;
          status?: EventStatus;
          mentor_name?: string | null;
          meeting_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_invitations: {
        Row: {
          id: string;
          event_id: string;
          student_id: string;
          response_status: InvitationResponseStatus;
          invited_at: string;
          responded_at: string | null;
          decline_reason: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          student_id: string;
          response_status?: InvitationResponseStatus;
          invited_at?: string;
          responded_at?: string | null;
          decline_reason?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          student_id?: string;
          response_status?: InvitationResponseStatus;
          invited_at?: string;
          responded_at?: string | null;
          decline_reason?: string | null;
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
