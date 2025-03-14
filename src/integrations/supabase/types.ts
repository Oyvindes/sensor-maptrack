export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      folder_sensors: {
        Row: {
          created_at: string | null
          folder_id: string | null
          id: string
          sensor_imei: string
        }
        Insert: {
          created_at?: string | null
          folder_id?: string | null
          id?: string
          sensor_imei?: string
        }
        Update: {
          created_at?: string | null
          folder_id?: string | null
          id?: string
          sensor_imei?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_sensors_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sensor_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folder_sensors_sensor_imei_fkey"
            columns: ["sensor_imei"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["imei"]
          },
        ]
      }
      project_pdfs: {
        Row: {
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          filename: string
          folder_id: string | null
          id: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          creator_name?: string | null
          filename: string
          folder_id?: string | null
          id?: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          creator_name?: string | null
          filename?: string
          folder_id?: string | null
          id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pdfs_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sensor_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_folders: {
        Row: {
          address: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          location: Json | null
          name: string
          project_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          name: string
          project_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          name?: string
          project_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_folders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_values: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          sensor_imei: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload: Json
          sensor_imei: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          sensor_imei?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_values_sensor_imei_fkey"
            columns: ["sensor_imei"]
            isOneToOne: false
            referencedRelation: "sensors"
            referencedColumns: ["imei"]
          },
        ]
      }
      sensors: {
        Row: {
          company_id: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          imei: string
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          imei: string
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          imei?: string
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tracking_objects: {
        Row: {
          battery_level: number | null
          company_id: string | null
          direction: number | null
          id: string
          last_updated: string | null
          name: string
          position: Json
          speed: number | null
        }
        Insert: {
          battery_level?: number | null
          company_id?: string | null
          direction?: number | null
          id?: string
          last_updated?: string | null
          name: string
          position: Json
          speed?: number | null
        }
        Update: {
          battery_level?: number | null
          company_id?: string | null
          direction?: number | null
          id?: string
          last_updated?: string | null
          name?: string
          position?: Json
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_objects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
