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
      device_positions: {
        Row: {
          battery_level: number | null
          created_at: string | null
          device_id: string | null
          direction: number | null
          id: string
          latitude: number
          longitude: number
          speed: number | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string | null
          device_id?: string | null
          direction?: number | null
          id?: string
          latitude: number
          longitude: number
          speed?: number | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string | null
          device_id?: string | null
          direction?: number | null
          id?: string
          latitude?: number
          longitude?: number
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_positions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          company_id: string | null
          created_at: string | null
          folder_id: string | null
          id: string
          imei: string | null
          last_seen: string | null
          location: Json | null
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          imei?: string | null
          last_seen?: string | null
          location?: Json | null
          name: string
          status: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          folder_id?: string | null
          id?: string
          imei?: string | null
          last_seen?: string | null
          location?: Json | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sensor_folders"
            referencedColumns: ["id"]
          },
        ]
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
      pdf_records: {
        Row: {
          content_base64: string | null
          created_at: string
          created_by: string | null
          creator_name: string | null
          filename: string
          folder_id: string | null
          id: string
        }
        Insert: {
          content_base64?: string | null
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          filename: string
          folder_id?: string | null
          id?: string
        }
        Update: {
          content_base64?: string | null
          created_at?: string
          created_by?: string | null
          creator_name?: string | null
          filename?: string
          folder_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_records_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sensor_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
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
      purchases: {
        Row: {
          carrier: string | null
          company_id: string
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          customer_reference: string | null
          id: string
          notes: string | null
          order_details: string | null
          order_reference: string | null
          product_id: string
          purchased_at: string
          purchased_by: string
          quantity: number
          shipped_date: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string | null
          shipping_postal_code: string | null
          status: string
          total_price: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          company_id: string
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          customer_reference?: string | null
          id?: string
          notes?: string | null
          order_details?: string | null
          order_reference?: string | null
          product_id: string
          purchased_at?: string
          purchased_by: string
          quantity: number
          shipped_date?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          status: string
          total_price: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          company_id?: string
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          customer_reference?: string | null
          id?: string
          notes?: string | null
          order_details?: string | null
          order_reference?: string | null
          product_id?: string
          purchased_at?: string
          purchased_by?: string
          quantity?: number
          shipped_date?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string | null
          shipping_postal_code?: string | null
          status?: string
          total_price?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          folder_id: string | null
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
          folder_id?: string | null
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
          folder_id?: string | null
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
          {
            foreignKeyName: "tracking_objects_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "sensor_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          is_company_admin: boolean | null
          last_login: string | null
          name: string
          password_hash: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_company_admin?: boolean | null
          last_login?: string | null
          name: string
          password_hash: string
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_company_admin?: boolean | null
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
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
      check_rls_enabled: {
        Args: {
          table_name: string
        }
        Returns: boolean
      }
      migrate_mock_devices: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
