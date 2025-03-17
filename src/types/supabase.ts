
// Type for valid Supabase table names
export type SupabaseTable = 
  | "companies" 
  | "device_positions" 
  | "devices" 
  | "sensor_folders" 
  | "folder_sensors" 
  | "sensors" 
  | "pdf_records" 
  | "products" 
  | "project_pdfs" 
  | "purchases" 
  | "sensor_values" 
  | "tracking_objects" 
  | "users";

// Type for valid Supabase function names
export type SupabaseFunction = 
  | "check_rls_enabled" 
  | "migrate_mock_devices"
  | "get_table_columns"
  | "create_users_table_if_not_exists";
