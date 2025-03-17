export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string
          name: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string
          name: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      folder_sensors: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          sensor_imei: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          sensor_imei: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          sensor_imei?: string
        }
        Relationships: {
          folder_id: "sensor_folders"
          sensor_imei: "sensors"
        }
      }
      pdf_records: {
        Row: {
          id: string
          folder_id: string
          filename: string
          created_at: string
          created_by: string | null
          creator_name: string | null
          content_base64: string | null
        }
        Insert: {
          id?: string
          folder_id: string
          filename: string
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          content_base64?: string | null
        }
        Update: {
          id?: string
          folder_id?: string
          filename?: string
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          content_base64?: string | null
        }
        Relationships: {
          folder_id: "sensor_folders"
          created_by: "users"
        }
      }
      sensor_folders: {
        Row: {
          id: string
          name: string
          created_at: string
          description: string | null
          company_id: string | null
          project_number: string | null
          address: string | null
          location: Json | null
          updated_at: string
          status: string | null
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          description?: string | null
          company_id?: string | null
          project_number?: string | null
          address?: string | null
          location?: Json | null
          updated_at?: string
          status?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          description?: string | null
          company_id?: string | null
          project_number?: string | null
          address?: string | null
          location?: Json | null
          updated_at?: string
          status?: string | null
        }
        Relationships: {
          company_id: "companies"
        }
      }
      sensors: {
        Row: {
          id: string
          name: string
          imei: string | null
          status: string
          folder_id: string | null
          company_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          imei?: string | null
          status?: string
          folder_id?: string | null
          company_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          imei?: string | null
          status?: string
          folder_id?: string | null
          company_id?: string | null
          updated_at?: string
        }
        Relationships: {
          company_id: "companies"
          folder_id: "sensor_folders"
        }
      }
      sensor_values: {
        Row: {
          id: string
          sensor_imei: string
          created_at: string
          payload: Json
        }
        Insert: {
          id?: string
          sensor_imei: string
          created_at?: string
          payload: Json
        }
        Update: {
          id?: string
          sensor_imei?: string
          created_at?: string
          payload?: Json
        }
        Relationships: {
          sensor_imei: "sensors"
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          role: string
          company_id: string | null
          last_login: string | null
          status: string
          is_company_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password_hash: string
          role: string
          company_id?: string | null
          last_login?: string | null
          status?: string
          is_company_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          role?: string
          company_id?: string | null
          last_login?: string | null
          status?: string
          is_company_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: {
          company_id: "companies"
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
