export type UserRole = 'CITIZEN' | 'GOVERNMENT' | 'FIELD_WORKER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  ward?: string;
  employeeId?: string;
  workerId?: string;
  phone?: string;
  token?: string;
}

export type Priority = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export type EmergencyStatus =
  | 'ALERT_SENT'
  | 'ACKNOWLEDGED'
  | 'TEAM_ASSIGNED'
  | 'RESPONDING'
  | 'ON_SITE'
  | 'RESOLVED';

export type VerificationState =
  | 'PENDING'
  | 'VERIFIED_FIXED'
  | 'DISPUTED_STILL_EXISTS';

export interface LocationCoordinates {
  address: string;
  lat: number;
  lng: number;
  ward: string;
  landmark?: string;
}

export interface Complaint {
  id: string;
  citizenId: string;
  citizenName: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: ComplaintStatus;
  ward: string;
  location: LocationCoordinates;
  department: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  citizenPhoto?: string;
  resolutionPhoto?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string[];
  citizenVerification?: VerificationState;
  isEmergency?: boolean;
  emergencyId?: string;
  riskAssessment?: string;
}

export interface EmergencyIncident {
  id: string;
  complaintId?: string;
  title: string;
  hazardDescription: string;
  ward: string;
  location: LocationCoordinates;
  status: EmergencyStatus;
  reportedAt: string;
  severity: 'EMERGENCY';
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  photo?: string;
  department: string;
  governmentInstructions?: string;
  resolutionNotes?: string;
  resolutionPhoto?: string;
  acknowledgedAt?: string;
  onSiteAt?: string;
  resolvedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  nameHi: string;
  officerInCharge: string;
  activeStaff: number;
  openComplaints: number;
  emergencyContact: string;
}

export interface Ward {
  id: string;
  name: string;
  nameHi: string;
  councillor: string;
  population: string;
  activeComplaints: number;
  resolvedComplaints: number;
  center: [number, number];
}

export interface FieldWorkerRecord {
  id: string;
  name: string;
  workerId: string;
  department: string;
  ward: string;
  phone: string;
  activeTasks: number;
  status: 'AVAILABLE' | 'ON_SITE' | 'RESPONDING';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  targetId: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  recipientRole: UserRole | 'ALL';
  channel: 'PORTAL' | 'SMS' | 'WHATSAPP' | 'EMAIL';
  title: string;
  message: string;
  status: 'DELIVERED' | 'CONFIG_REQUIRED' | 'FAILED';
  deliveryNote?: string;
}

export interface AIAnalysisResult {
  issue: string;
  category: string;
  severity: Priority;
  possibleRisk: string;
  suggestedDepartment: string;
  detectedWard: string;
  advisoryNote: string;
  isPotentialHazard: boolean;
  hazardType?: string;
}
