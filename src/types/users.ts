export interface Company {
	id: string;
	name: string;
	industry: string;
	createdAt: string;
	status: 'active' | 'inactive';
}

export interface User {
	id: string;
	name: string;
	email: string;
	password: string;
	role: 'admin' | 'user' | 'master';
	companyId: string;
	lastLogin: string;
	status: 'active' | 'inactive';
	isCompanyAdmin?: boolean; // New field to mark users as company admins
}

export interface ReportRecord {
	id: string;
	filename: string;
	createdAt: string;
	createdBy?: string;
	creatorName?: string;
	blobUrl?: string; // For immediate viewing in the session
	type: 'pdf' | 'html'; // Type of report
}

// For backward compatibility
export type PdfRecord = ReportRecord;

export interface SensorPlacementImage {
	sensorId: string;
	imageUrl: string;
	caption?: string;
	createdAt: string;
}

// Norwegian insurance companies
export type InsuranceCompany =
  | 'Gjensidige'
  | 'If'
  | 'Tryg'
  | 'SpareBank 1'
  | 'Storebrand'
  | 'Fremtind'
  | 'Eika Forsikring'
  | 'KLP'
  | 'Protector Forsikring'
  | 'Frende Forsikring'
  | 'DNB Forsikring';

export interface SensorFolder {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  parentId?: string; // For nested folders
  createdAt: string;
  createdBy?: string; // ID of the user who created the folder
  creatorName?: string; // Name of the user who created the folder
  projectNumber?: string; // New field for project number
  address?: string; // New field for project address
  assignedSensorImeis?: string[]; // New field for assigned sensors
  location?: { lat: number; lng: number } | string; // New field for geolocation
  status?: 'running' | 'stopped'; // Project running status
  startedAt?: string; // Timestamp when project was last started
  stoppedAt?: string; // Timestamp when project was last stopped
  projectStartDate?: string; // Calendar date when project is scheduled to start
  projectEndDate?: string; // Calendar date when project is scheduled to end
  pdfHistory?: ReportRecord[]; // History of generated reports (PDF and HTML)
  sensorPlacementImages?: SensorPlacementImage[]; // Images showing sensor placements
  sensorImages?: string[]; // Simple array of image URLs for sensor placements
  hasImageIssues?: boolean; // Flag indicating if there are issues with sensor images
  insuranceCompany?: InsuranceCompany; // Insurance company handling the project
  sensorLocations?: Record<string, string>; // Map of sensor IMEI to location name (e.g., livingroom, kitchen)
  sensorZones?: Record<string, 'wet' | 'dry'>; // Map of sensor IMEI to zone type
  sensorTypes?: Record<string, 'wood' | 'concrete'>; // Map of sensor IMEI to material type being measured
}

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
}
