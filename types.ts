
export enum UserRole {
  Admin = 'Admin',
  Supporting = 'Supporting',
  Manager = 'Manager',
  Supervisor = 'Supervisor',
  Chemist = 'Chemist',
  Analyst = 'Analyst'
}

export enum Category {
  HPLC = 'HPLC',
  LCMS = 'LC-MS',
  GCMS = 'GC-MS',
  SPECTRO = 'Spectrophotometer',
  PHMETER = 'pH Meter',
  CENTRIFUGE = 'Centrifuge',
  BALANCE_ANA = 'Analytical Balance',
  FUMEHOOD = 'Fume Hood',
  MICROPIPETTE = 'Micropipette',
  ULTRASONIC = 'Ultrasonic'
}

export enum EquipmentStatus {
  OK = 'OK',
  Service = 'Service',
  Calibration = 'Calibration',
  Verification = 'Verification',
  Unused = 'Unused'
}

export enum Division {
  ASLT = 'ASLT',
  GCS = 'GC-S',
  LOGAM = 'LOGAM',
  MS = 'MS',
  HPLC = 'HPLC',
  ExternalProject = 'External Project'
}

export interface Equipment {
  id: string; // Manual Input
  category: string; // Changed from Category enum to string to allow custom additions
  brand: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  status: EquipmentStatus;
  division: Division;
  location?: string; // Added Location field
  calibrationMeasuringPoint?: string; // New Field
  personInCharge?: string; // New Field
  image?: string; // Base64 encoded image
  calibrationCert?: string; // Mocked file name
  verificationCert?: string; // Mocked file name
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  email: string;
  password?: string;
}

export interface AuditLog {
  id?: number; // Auto-incremented
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'IMPORT';
  targetId: string; // Equipment ID or 'DATABASE'
  targetName: string; // Equipment Brand/Model or Description
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface Notification {
  id?: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'create' | 'update' | 'delete' | 'system';
}

export type Theme = 'light' | 'dark';

export interface DashboardStats {
  total: number;
  inService: number;
  needsCalibration: number;
  unused: number;
}

// --- New Scheduling Types ---

export enum EventType {
  Maintenance = 'Maintenance',
  Calibration = 'Calibration',
  Verification = 'Verification'
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  startDate: string; // ISO String
  endDate: string;   // ISO String
  type: EventType;
  equipmentId?: string; // Optional link to specific equipment
  createdBy: string;
}

// --- Job Request Types ---

export enum JobRequestStatus {
  Requests = 'Requests',
  OnProgress = 'On Progress',
  Finished = 'Finished',
  Rejected = 'Rejected'
}

export enum JobCategory {
  Maintenance = 'Maintenance',
  Troubleshooting = 'Troubleshooting',
  Documents = 'Documents'
}

export interface JobRequest {
  id?: number;
  title: string;
  requestorId: string;
  requestorName: string;
  division: string;
  description: string;
  category?: JobCategory;
  requestedAt: string;
  startDate: string;
  dueDate: string;
  assignedToId: string;
  status: JobRequestStatus;
}
