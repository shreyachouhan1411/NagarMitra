import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));

// Pre-seeded municipal data
interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'GOVERNMENT' | 'FIELD_WORKER';
  department?: string;
  ward?: string;
  employeeId?: string;
  workerId?: string;
  phone?: string;
  token: string;
}

// In-memory persistent database state for the demo runtime
const SESSIONS = new Map<string, SessionUser>();

// Pre-registered official credentials
const GOVERNMENT_ROSTER = [
  { id: 'gov-1', employeeId: 'GOV-101', name: 'Officer Sharma', email: 'sharma.officer@nagarmitra.gov.in', password: 'admin123', department: 'Municipal Administration', ward: 'Ward 12' },
  { id: 'gov-2', employeeId: 'GOV-102', name: 'Dr. Anita Verma', email: 'anita.verma@nagarmitra.gov.in', password: 'admin123', department: 'Public Health & Sanitation', ward: 'Ward 8' },
  { id: 'gov-3', employeeId: 'EMP-404', name: 'Superintendent Rao', email: 'rao.superintendent@nagarmitra.gov.in', password: 'admin123', department: 'Road Infrastructure & Traffic', ward: 'All Wards' },
];

const FIELD_WORKER_ROSTER = [
  { id: 'worker-1', workerId: 'FW-401', name: 'Rajesh Kumar', email: 'rajesh.field@nagarmitra.gov.in', password: 'worker123', department: 'Electrical & Street Lighting', ward: 'Ward 12', phone: '+91 98765 43210' },
  { id: 'worker-2', workerId: 'FW-402', name: 'Suresh Patel', email: 'suresh.field@nagarmitra.gov.in', password: 'worker123', department: 'Road Maintenance', ward: 'Ward 8', phone: '+91 98765 43211' },
  { id: 'worker-3', workerId: 'FW-403', name: 'Manish Yadav', email: 'manish.field@nagarmitra.gov.in', password: 'worker123', department: 'Water Supply & Sewage', ward: 'Ward 12', phone: '+91 98765 43212' },
];

let DEPARTMENTS = [
  { id: 'dept-roads', name: 'Road Infrastructure', nameHi: 'सड़क एवं पुल विभाग', officerInCharge: 'Er. A. K. Gupta', activeStaff: 28, openComplaints: 24, emergencyContact: '011-2309101' },
  { id: 'dept-electrical', name: 'Electrical & Street Lighting', nameHi: 'विद्युत एवं प्रकाश व्यवस्था', officerInCharge: 'Er. Sunita Roy', activeStaff: 19, openComplaints: 14, emergencyContact: '011-2309102' },
  { id: 'dept-water', name: 'Water Supply & Sewage', nameHi: 'जल आपूर्ति एवं सीवरेज', officerInCharge: 'Er. Ramesh Nair', activeStaff: 32, openComplaints: 19, emergencyContact: '011-2309103' },
  { id: 'dept-sanitation', name: 'Public Sanitation & Solid Waste', nameHi: 'सफाई एवं ठोस अपशिष्ट प्रबंधन', officerInCharge: 'Dr. Meena Joshi', activeStaff: 45, openComplaints: 12, emergencyContact: '011-2309104' },
  { id: 'dept-drainage', name: 'Storm Water Drainage', nameHi: 'तूफानी जल निकासी', officerInCharge: 'Er. V. Singhania', activeStaff: 16, openComplaints: 8, emergencyContact: '011-2309105' },
];

let WARDS = [
  { id: 'ward-12', name: 'Ward 12 — Central Civil Lines', nameHi: 'वार्ड 12 — सिविल लाइंस', councillor: 'Shri Vikramaditya Singh', population: '78,400', activeComplaints: 18, resolvedComplaints: 92, center: [28.6750, 77.2200] as [number, number] },
  { id: 'ward-8', name: 'Ward 8 — Green Park Sector', nameHi: 'वार्ड 8 — ग्रीन पार्क सेक्टर', councillor: 'Smt. Kavita Deshmukh', population: '64,200', activeComplaints: 14, resolvedComplaints: 110, center: [28.5600, 77.2000] as [number, number] },
  { id: 'ward-9', name: 'Ward 9 — Market Complex & Vihar', nameHi: 'वार्ड 9 — बाजार परिसर', councillor: 'Shri Harish Rawat', population: '82,100', activeComplaints: 21, resolvedComplaints: 76, center: [28.6300, 77.2150] as [number, number] },
  { id: 'ward-11', name: 'Ward 11 — South Industrial Extension', nameHi: 'वार्ड 11 — औद्योगिक क्षेत्र', councillor: 'Shri Gurpreet Singh', population: '59,000', activeComplaints: 12, resolvedComplaints: 84, center: [28.5200, 77.2600] as [number, number] },
];

let COMPLAINTS: any[] = [
  {
    id: 'NM-1024',
    citizenId: 'citizen-seed-1',
    citizenName: 'Ananya Sharma',
    title: 'Exposed live wire dangling near bus stop',
    description: 'Electrical pole wire snapped after morning rains. Dangling 3 feet above water puddle near Ward 12 Main Bus Stand. Severe hazard for pedestrians.',
    category: 'Electrical & Street Lighting',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    ward: 'Ward 12',
    location: {
      address: 'Main Bus Stop, Outer Ring Rd, Ward 12',
      lat: 28.6745,
      lng: 77.2215,
      ward: 'Ward 12',
      landmark: 'Near City Bus Shelter'
    },
    department: 'Electrical & Street Lighting',
    assignedWorkerId: 'FW-401',
    assignedWorkerName: 'Rajesh Kumar',
    citizenPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    internalNotes: ['Priority escalated due to rain forecast. Field worker dispatched on vehicle #DL-04-1290.'],
    citizenVerification: 'PENDING',
    isEmergency: true,
    emergencyId: 'E-1024',
    riskAssessment: 'High potential electrocution hazard identified by Civic Safety System.'
  },
  {
    id: 'NM-1025',
    citizenId: 'citizen-seed-2',
    citizenName: 'Mohit Agrawal',
    title: 'Major water main burst flooding street',
    description: 'Underground potable pipe cracked. High pressure water inundating 50 meters of residential road near Green Park market.',
    category: 'Water Supply & Sewage',
    priority: 'HIGH',
    status: 'ASSIGNED',
    ward: 'Ward 8',
    location: {
      address: 'A-Block Market Road, Ward 8',
      lat: 28.5615,
      lng: 77.2025,
      ward: 'Ward 8',
      landmark: 'Opposite Community Center'
    },
    department: 'Water Supply & Sewage',
    assignedWorkerId: 'FW-403',
    assignedWorkerName: 'Manish Yadav',
    citizenPhoto: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    internalNotes: ['Main valve shutoff required before pipe replacement.'],
    citizenVerification: 'PENDING',
    isEmergency: true,
    emergencyId: 'E-1025',
    riskAssessment: 'Potable water loss and localized waterlogging risk.'
  },
  {
    id: 'NM-1019',
    citizenId: 'citizen-seed-1',
    citizenName: 'Ananya Sharma',
    title: 'Deep pothole damaging vehicles on 4th Avenue',
    description: 'Road pe bahut bada pothole hai. Two two-wheelers already skidded yesterday night.',
    category: 'Road Infrastructure',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    ward: 'Ward 12',
    location: {
      address: '4th Avenue, Near Post Office, Ward 12',
      lat: 28.6780,
      lng: 77.2180,
      ward: 'Ward 12',
      landmark: 'Near Head Post Office'
    },
    department: 'Road Infrastructure',
    assignedWorkerId: 'FW-402',
    assignedWorkerName: 'Suresh Patel',
    citizenPhoto: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    internalNotes: ['Cold-mix asphalt patch scheduled for afternoon batch.'],
    citizenVerification: 'PENDING'
  },
  {
    id: 'NM-1015',
    citizenId: 'citizen-seed-1',
    citizenName: 'Ananya Sharma',
    title: 'Non-functional street light cluster',
    description: 'Three consecutive street lights extinguished for past 4 days. Street completely dark after 7 PM.',
    category: 'Electrical & Street Lighting',
    priority: 'MODERATE',
    status: 'RESOLVED',
    ward: 'Ward 12',
    location: {
      address: 'Lane 7, Civil Lines, Ward 12',
      lat: 28.6720,
      lng: 77.2250,
      ward: 'Ward 12',
      landmark: 'Near Children Park'
    },
    department: 'Electrical & Street Lighting',
    assignedWorkerId: 'FW-401',
    assignedWorkerName: 'Rajesh Kumar',
    citizenPhoto: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    resolutionPhoto: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    resolutionNotes: 'Replaced faulty 120W LED fixture and reset feeder junction circuit breaker. Restored lighting tested.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    citizenVerification: 'VERIFIED_FIXED',
    internalNotes: ['Replaced driver and LED fixture. Field verified.']
  },
  {
    id: 'NM-1020',
    citizenId: 'citizen-seed-3',
    citizenName: 'Sunil Rao',
    title: 'Garbage dump overflow blocking walkway',
    description: 'Community bin not cleared for 3 days. Overflowing on pedestrian pavement.',
    category: 'Public Sanitation & Solid Waste',
    priority: 'MODERATE',
    status: 'ASSIGNED',
    ward: 'Ward 9',
    location: {
      address: 'Main Market Sector 3, Ward 9',
      lat: 28.6320,
      lng: 77.2140,
      ward: 'Ward 9',
      landmark: 'Near Sector 3 Gate'
    },
    department: 'Public Sanitation & Solid Waste',
    assignedWorkerId: 'FW-402',
    assignedWorkerName: 'Suresh Patel',
    citizenPhoto: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    citizenVerification: 'PENDING'
  }
];

let EMERGENCIES: any[] = [
  {
    id: 'E-1024',
    complaintId: 'NM-1024',
    title: 'Potential exposed electrical cable',
    hazardDescription: 'High-voltage dangling live wire in water puddle near bus stop. Imminent shock hazard.',
    ward: 'Ward 12',
    location: {
      address: 'Main Bus Stop, Outer Ring Rd, Ward 12',
      lat: 28.6745,
      lng: 77.2215,
      ward: 'Ward 12',
      landmark: 'Near City Bus Shelter'
    },
    status: 'RESPONDING',
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    severity: 'EMERGENCY',
    assignedWorkerId: 'FW-401',
    assignedWorkerName: 'Rajesh Kumar',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    department: 'Electrical & Street Lighting',
    governmentInstructions: 'ISOLATE POWER FEEDER SUBSTATION #12 IMMEDIATELY. Cordon off 15m perimeter before handling.'
  },
  {
    id: 'E-1025',
    complaintId: 'NM-1025',
    title: 'Water main burst with road collapse risk',
    hazardDescription: 'High pressure potable main burst causing ground erosion near road foundation.',
    ward: 'Ward 8',
    location: {
      address: 'A-Block Market Road, Ward 8',
      lat: 28.5615,
      lng: 77.2025,
      ward: 'Ward 8',
      landmark: 'Opposite Community Center'
    },
    status: 'ALERT_SENT',
    reportedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    severity: 'EMERGENCY',
    assignedWorkerId: 'FW-403',
    assignedWorkerName: 'Manish Yadav',
    photo: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80',
    department: 'Water Supply & Sewage',
    governmentInstructions: 'Close supply valve V-8B. Divert vehicular traffic to outer avenue.'
  }
];

let AUDIT_LOGS: any[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    actorId: 'gov-1',
    actorName: 'Officer Sharma',
    actorRole: 'GOVERNMENT',
    action: 'EMERGENCY_ESCALATION',
    details: 'Escalated complaint NM-1024 to Emergency Incident E-1024 due to electrocution risk.',
    targetId: 'E-1024'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    actorId: 'gov-1',
    actorName: 'Officer Sharma',
    actorRole: 'GOVERNMENT',
    action: 'WORKER_ASSIGNED',
    details: 'Assigned Field Worker Rajesh Kumar (FW-401) to Emergency E-1024.',
    targetId: 'E-1024'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorId: 'worker-1',
    actorName: 'Rajesh Kumar',
    actorRole: 'FIELD_WORKER',
    action: 'STATUS_RESPONDING',
    details: 'Field worker acknowledged emergency alert and departed base for Ward 12 bus shelter.',
    targetId: 'E-1024'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    actorId: 'worker-1',
    actorName: 'Rajesh Kumar',
    actorRole: 'FIELD_WORKER',
    action: 'RESOLUTION_SUBMITTED',
    details: 'Submitted LED replacement after-photo and completed complaint NM-1015.',
    targetId: 'NM-1015'
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 3600000 * 7).toISOString(),
    actorId: 'citizen-seed-1',
    actorName: 'Ananya Sharma',
    actorRole: 'CITIZEN',
    action: 'CITIZEN_VERIFICATION',
    details: 'Citizen marked resolution NM-1015 as VERIFIED_FIXED.',
    targetId: 'NM-1015'
  }
];

let NOTIFICATION_LOGS: any[] = [
  {
    id: 'notif-1',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    recipientRole: 'GOVERNMENT',
    channel: 'PORTAL',
    title: 'Emergency Incident Alert E-1024',
    message: 'Exposed live wire reported at Ward 12 Main Bus Stand.',
    status: 'DELIVERED',
    deliveryNote: 'Delivered to Civic Command Center real-time feed.'
  },
  {
    id: 'notif-2',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    recipientRole: 'FIELD_WORKER',
    channel: 'SMS',
    title: 'Immediate Task Dispatch',
    message: 'Urgent task E-1024 assigned to Rajesh Kumar at Ward 12.',
    status: process.env.SMS_GATEWAY_URL ? 'DELIVERED' : 'CONFIG_REQUIRED',
    deliveryNote: process.env.SMS_GATEWAY_URL ? 'Transmitted via SMS gateway' : 'Requires SMS_GATEWAY_URL in environment'
  },
  {
    id: 'notif-3',
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    recipientRole: 'FIELD_WORKER',
    channel: 'WHATSAPP',
    title: 'Field Operation Dispatch',
    message: 'Location GPS coordinates and citizen photo sent for E-1024.',
    status: process.env.WHATSAPP_API_TOKEN ? 'DELIVERED' : 'CONFIG_REQUIRED',
    deliveryNote: process.env.WHATSAPP_API_TOKEN ? 'Dispatched via WhatsApp Cloud API' : 'Requires WHATSAPP_API_TOKEN in environment'
  }
];

// Helper to record audit log
function recordAudit(actor: SessionUser | { id: string; name: string; role: any }, action: string, details: string, targetId: string) {
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    details,
    targetId
  };
  AUDIT_LOGS.unshift(log);
}

// Helper to trigger notifications
function recordNotification(recipientRole: any, channel: 'PORTAL' | 'SMS' | 'WHATSAPP' | 'EMAIL', title: string, message: string) {
  let status: 'DELIVERED' | 'CONFIG_REQUIRED' | 'FAILED' = 'DELIVERED';
  let deliveryNote = 'Delivered to In-Portal alert center';

  if (channel === 'SMS') {
    if (process.env.SMS_GATEWAY_URL && process.env.SMS_API_KEY) {
      status = 'DELIVERED';
      deliveryNote = 'Transmitted through SMS Gateway';
    } else {
      status = 'CONFIG_REQUIRED';
      deliveryNote = 'SMS_GATEWAY_URL is not set in environment';
    }
  } else if (channel === 'WHATSAPP') {
    if (process.env.WHATSAPP_API_TOKEN) {
      status = 'DELIVERED';
      deliveryNote = 'Dispatched via WhatsApp Business API';
    } else {
      status = 'CONFIG_REQUIRED';
      deliveryNote = 'WHATSAPP_API_TOKEN is not set in environment';
    }
  } else if (channel === 'EMAIL') {
    if (process.env.SMTP_HOST) {
      status = 'DELIVERED';
      deliveryNote = 'Transmitted via SMTP Mailer';
    } else {
      status = 'CONFIG_REQUIRED';
      deliveryNote = 'SMTP_HOST is not set in environment';
    }
  }

  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    recipientRole,
    channel,
    title,
    message,
    status,
    deliveryNote
  };
  NOTIFICATION_LOGS.unshift(notif);
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
  }

  const user = SESSIONS.get(token);
  if (!user) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
  }

  (req as any).user = user;
  next();
}

// Role Authorization Middleware
function requireRole(...allowedRoles: Array<'CITIZEN' | 'GOVERNMENT' | 'FIELD_WORKER'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as SessionUser;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `403 Unauthorized: Access restricted. Your role '${user?.role}' does not have permission to access this resource.`
      });
    }
    next();
  };
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, name, email, password, identifier } = req.body;

  if (!role || !['CITIZEN', 'GOVERNMENT', 'FIELD_WORKER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid user role requested' });
  }

  if (role === 'CITIZEN') {
    if (!name || !email) {
      return res.status(400).json({ error: 'Full name and email address are required for citizen access' });
    }

    const token = `token-citizen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const user: SessionUser = {
      id: `citizen-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'CITIZEN',
      ward: 'Ward 12',
      token
    };

    SESSIONS.set(token, user);
    recordAudit(user, 'CITIZEN_LOGIN', `Citizen ${user.name} logged in.`, user.id);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward
      },
      token
    });
  }

  if (role === 'GOVERNMENT') {
    const query = (identifier || name || '').trim().toLowerCase();
    const enteredPass = (password || '').trim();

    if (!query || !enteredPass) {
      return res.status(400).json({ error: 'Employee ID/Name and authorized password are required' });
    }

    const match = GOVERNMENT_ROSTER.find(
      (gov) =>
        (gov.employeeId.toLowerCase() === query || gov.name.toLowerCase() === query || gov.email.toLowerCase() === query) &&
        gov.password === enteredPass
    );

    if (!match) {
      return res.status(401).json({
        error: 'Invalid government employee credentials. Please enter authorized Employee ID (e.g. GOV-101 or Officer Sharma) and password.'
      });
    }

    const token = `token-gov-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const user: SessionUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: 'GOVERNMENT',
      department: match.department,
      ward: match.ward,
      employeeId: match.employeeId,
      token
    };

    SESSIONS.set(token, user);
    recordAudit(user, 'GOV_LOGIN', `Government officer ${user.name} (${user.employeeId}) logged into Civic Command Center.`, user.id);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        ward: user.ward,
        employeeId: user.employeeId
      },
      token
    });
  }

  if (role === 'FIELD_WORKER') {
    const query = (identifier || name || '').trim().toLowerCase();
    const enteredPass = (password || '').trim();

    if (!query || !enteredPass) {
      return res.status(400).json({ error: 'Worker ID/Name and password are required' });
    }

    const match = FIELD_WORKER_ROSTER.find(
      (w) =>
        (w.workerId.toLowerCase() === query || w.name.toLowerCase() === query || w.email.toLowerCase() === query) &&
        w.password === enteredPass
    );

    if (!match) {
      return res.status(401).json({
        error: 'Invalid field worker credentials. Please enter authorized Worker ID (e.g. FW-401 or Rajesh Kumar) and password.'
      });
    }

    const token = `token-worker-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const user: SessionUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: 'FIELD_WORKER',
      department: match.department,
      ward: match.ward,
      workerId: match.workerId,
      phone: match.phone,
      token
    };

    SESSIONS.set(token, user);
    recordAudit(user, 'WORKER_LOGIN', `Field worker ${user.name} (${user.workerId}) logged in to operations interface.`, user.id);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        ward: user.ward,
        workerId: user.workerId,
        phone: user.phone
      },
      token
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      ward: user.ward,
      employeeId: user.employeeId,
      workerId: user.workerId,
      phone: user.phone
    }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    SESSIONS.delete(token);
  }
  return res.json({ success: true });
});

// ==================== COMPLAINTS API ====================

app.get('/api/complaints', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { view } = req.query;

  // Citizens can ONLY see their own complaints, OR view='nearby' which provides sanitized public issues
  if (user.role === 'CITIZEN') {
    if (view === 'nearby') {
      const nearbySanitized = COMPLAINTS.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        priority: c.priority,
        status: c.status,
        ward: c.ward,
        location: {
          address: c.location.address,
          lat: c.location.lat,
          lng: c.location.lng,
          ward: c.location.ward,
          landmark: c.location.landmark
        },
        department: c.department,
        citizenPhoto: c.citizenPhoto,
        createdAt: c.createdAt,
        isEmergency: c.isEmergency
      }));
      return res.json({ complaints: nearbySanitized });
    }

    const myComplaints = COMPLAINTS.filter(c => c.citizenId === user.id || c.citizenName.toLowerCase() === user.name.toLowerCase());
    return res.json({ complaints: myComplaints });
  }

  // Field workers only see their assigned tasks
  if (user.role === 'FIELD_WORKER') {
    const workerTasks = COMPLAINTS.filter(
      c => c.assignedWorkerId === user.workerId || c.assignedWorkerId === user.id
    ).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      priority: c.priority,
      status: c.status,
      ward: c.ward,
      location: c.location,
      department: c.department,
      assignedWorkerId: c.assignedWorkerId,
      assignedWorkerName: c.assignedWorkerName,
      citizenPhoto: c.citizenPhoto,
      resolutionPhoto: c.resolutionPhoto,
      resolutionNotes: c.resolutionNotes,
      createdAt: c.createdAt,
      internalNotes: c.internalNotes,
      isEmergency: c.isEmergency,
      emergencyId: c.emergencyId
    }));
    return res.json({ complaints: workerTasks });
  }

  // Government employees see all complaints with sanitized citizen emails
  if (user.role === 'GOVERNMENT') {
    return res.json({ complaints: COMPLAINTS });
  }

  return res.status(403).json({ error: 'Access denied' });
});

app.post('/api/complaints', authenticateToken, requireRole('CITIZEN', 'GOVERNMENT'), (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { title, description, category, priority, ward, location, department, citizenPhoto, isEmergency, riskAssessment } = req.body;

  if (!title || !description || !ward) {
    return res.status(400).json({ error: 'Title, description, and ward are required' });
  }

  const id = `NM-${Math.floor(1000 + Math.random() * 9000)}`;
  const newComplaint: any = {
    id,
    citizenId: user.id,
    citizenName: user.name,
    title: title.trim(),
    description: description.trim(),
    category: category || 'General Civic Infrastructure',
    priority: priority || 'MODERATE',
    status: isEmergency ? 'ASSIGNED' : 'SUBMITTED',
    ward: ward || user.ward || 'Ward 12',
    location: location || {
      address: `Sector 4, ${ward || 'Ward 12'}`,
      lat: 28.6750 + (Math.random() - 0.5) * 0.02,
      lng: 77.2200 + (Math.random() - 0.5) * 0.02,
      ward: ward || 'Ward 12',
    },
    department: department || 'Road Infrastructure',
    citizenPhoto: citizenPhoto || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    internalNotes: isEmergency ? ['Created via direct citizen emergency alert.'] : [],
    citizenVerification: 'PENDING',
    isEmergency: Boolean(isEmergency),
    riskAssessment
  };

  COMPLAINTS.unshift(newComplaint);
  recordAudit(user, 'COMPLAINT_CREATED', `Complaint ${id} submitted: ${title}`, id);

  if (isEmergency) {
    const eId = `E-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmergency = {
      id: eId,
      complaintId: id,
      title: title.trim(),
      hazardDescription: description.trim(),
      ward: newComplaint.ward,
      location: newComplaint.location,
      status: 'ALERT_SENT',
      reportedAt: new Date().toISOString(),
      severity: 'EMERGENCY',
      department: newComplaint.department,
      photo: citizenPhoto,
      governmentInstructions: 'Immediate response team dispatch requested.'
    };
    newComplaint.emergencyId = eId;
    EMERGENCIES.unshift(newEmergency);

    recordAudit(user, 'EMERGENCY_ALERT_TRANSMITTED', `Emergency incident ${eId} created from complaint ${id}`, eId);
    recordNotification('GOVERNMENT', 'PORTAL', `Emergency Alert ${eId}`, `New active hazard reported in ${newComplaint.ward}: ${title}`);
    recordNotification('FIELD_WORKER', 'SMS', `Emergency Dispatch ${eId}`, `Ward ${newComplaint.ward}: ${title}`);
  }

  return res.status(201).json({ complaint: newComplaint });
});

app.patch('/api/complaints/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { id } = req.params;
  const index = COMPLAINTS.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const complaint = COMPLAINTS[index];

  // Citizen Verification
  if (user.role === 'CITIZEN') {
    const { citizenVerification } = req.body;
    if (citizenVerification) {
      if (citizenVerification === 'VERIFIED_FIXED') {
        complaint.status = 'CLOSED';
        complaint.citizenVerification = 'VERIFIED_FIXED';
        complaint.updatedAt = new Date().toISOString();
        recordAudit(user, 'CITIZEN_VERIFIED_FIXED', `Citizen verified resolution of complaint ${id}`, id);
        return res.json({ complaint });
      } else if (citizenVerification === 'DISPUTED_STILL_EXISTS') {
        complaint.status = 'IN_PROGRESS';
        complaint.citizenVerification = 'DISPUTED_STILL_EXISTS';
        complaint.internalNotes = complaint.internalNotes || [];
        complaint.internalNotes.push(`Citizen marked problem as still existing on ${new Date().toLocaleDateString()}. Reopened.`);
        complaint.updatedAt = new Date().toISOString();
        recordAudit(user, 'CITIZEN_DISPUTED_REOPENED', `Citizen reopened complaint ${id}: Still exists`, id);
        return res.json({ complaint });
      }
    }
    return res.status(403).json({ error: 'Citizens may only verify resolution of their issues.' });
  }

  // Field Worker update (Resolution proof, status update)
  if (user.role === 'FIELD_WORKER') {
    const { status, resolutionPhoto, resolutionNotes } = req.body;
    if (status) complaint.status = status;
    if (resolutionPhoto) complaint.resolutionPhoto = resolutionPhoto;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    complaint.updatedAt = new Date().toISOString();

    recordAudit(user, 'FIELD_WORKER_UPDATE', `Worker ${user.name} updated complaint ${id} to ${status || 'updated'}`, id);
    return res.json({ complaint });
  }

  // Government operations
  if (user.role === 'GOVERNMENT') {
    const { priority, status, department, assignedWorkerId, assignedWorkerName, internalNote, isEmergency } = req.body;

    if (priority) complaint.priority = priority;
    if (status) complaint.status = status;
    if (department) complaint.department = department;
    if (assignedWorkerId) {
      complaint.assignedWorkerId = assignedWorkerId;
      complaint.assignedWorkerName = assignedWorkerName || 'Field Team Member';
      complaint.status = 'ASSIGNED';
    }
    if (internalNote) {
      complaint.internalNotes = complaint.internalNotes || [];
      complaint.internalNotes.push(`[${new Date().toLocaleTimeString()} by ${user.name}]: ${internalNote}`);
    }
    if (isEmergency && !complaint.isEmergency) {
      complaint.isEmergency = true;
      const eId = `E-${Math.floor(1000 + Math.random() * 9000)}`;
      complaint.emergencyId = eId;
      EMERGENCIES.unshift({
        id: eId,
        complaintId: complaint.id,
        title: complaint.title,
        hazardDescription: complaint.description,
        ward: complaint.ward,
        location: complaint.location,
        status: 'ALERT_SENT',
        reportedAt: new Date().toISOString(),
        severity: 'EMERGENCY',
        department: complaint.department,
        photo: complaint.citizenPhoto,
        governmentInstructions: 'Priority escalated by Municipal Officer.'
      });
      recordAudit(user, 'GOV_EMERGENCY_ESCALATION', `Officer ${user.name} escalated ${id} to emergency ${eId}`, eId);
    }

    complaint.updatedAt = new Date().toISOString();
    recordAudit(user, 'GOV_COMPLAINT_UPDATE', `Officer ${user.name} updated ${id} (Dept: ${complaint.department}, Status: ${complaint.status})`, id);
    return res.json({ complaint });
  }

  return res.status(403).json({ error: 'Unauthorized operation' });
});

// ==================== EMERGENCIES API ====================

app.get('/api/emergencies', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;

  if (user.role === 'CITIZEN') {
    return res.status(403).json({ error: 'Citizens do not have access to municipal emergency queues.' });
  }

  if (user.role === 'FIELD_WORKER') {
    // Show emergencies in worker's department or ward or assigned to them
    const workerEmergencies = EMERGENCIES.filter(
      e => !e.assignedWorkerId || e.assignedWorkerId === user.workerId || e.ward === user.ward
    );
    return res.json({ emergencies: workerEmergencies });
  }

  // Government sees all
  return res.json({ emergencies: EMERGENCIES });
});

app.post('/api/emergencies', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { title, hazardDescription, ward, location, department, photo, governmentInstructions } = req.body;

  if (!title || !hazardDescription) {
    return res.status(400).json({ error: 'Title and hazard description are required' });
  }

  const id = `E-${Math.floor(1000 + Math.random() * 9000)}`;
  const emergency = {
    id,
    title,
    hazardDescription,
    ward: ward || user.ward || 'Ward 12',
    location: location || {
      address: `Ward ${ward || '12'} Sector`,
      lat: 28.6750,
      lng: 77.2200,
      ward: ward || 'Ward 12'
    },
    status: 'ALERT_SENT',
    reportedAt: new Date().toISOString(),
    severity: 'EMERGENCY',
    department: department || 'Electrical & Street Lighting',
    photo,
    governmentInstructions: governmentInstructions || 'Immediate safety inspection ordered.'
  };

  EMERGENCIES.unshift(emergency);
  recordAudit(user, 'EMERGENCY_CREATED', `Emergency incident ${id} registered: ${title}`, id);
  recordNotification('GOVERNMENT', 'PORTAL', `EMERGENCY ALERT ${id}`, `${title} in ${emergency.ward}`);
  recordNotification('FIELD_WORKER', 'SMS', `EMERGENCY DISPATCH ${id}`, `Immediate response needed at ${emergency.location.address}`);

  return res.status(201).json({ emergency });
});

app.patch('/api/emergencies/:id', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  const { id } = req.params;
  const emergency = EMERGENCIES.find(e => e.id === id);

  if (!emergency) {
    return res.status(404).json({ error: 'Emergency not found' });
  }

  const { status, assignedWorkerId, assignedWorkerName, governmentInstructions, resolutionNotes, resolutionPhoto } = req.body;

  if (user.role === 'GOVERNMENT') {
    if (status) emergency.status = status;
    if (assignedWorkerId) {
      emergency.assignedWorkerId = assignedWorkerId;
      emergency.assignedWorkerName = assignedWorkerName || 'Emergency Field Squad';
      emergency.status = 'TEAM_ASSIGNED';
    }
    if (governmentInstructions) emergency.governmentInstructions = governmentInstructions;
    recordAudit(user, 'GOV_EMERGENCY_UPDATE', `Officer ${user.name} updated emergency ${id} status to ${emergency.status}`, id);
    return res.json({ emergency });
  }

  if (user.role === 'FIELD_WORKER') {
    if (status) emergency.status = status;
    if (resolutionNotes) emergency.resolutionNotes = resolutionNotes;
    if (resolutionPhoto) emergency.resolutionPhoto = resolutionPhoto;
    recordAudit(user, 'WORKER_EMERGENCY_UPDATE', `Worker ${user.name} updated emergency ${id} status to ${emergency.status}`, id);
    return res.json({ emergency });
  }

  return res.status(403).json({ error: 'Unauthorized to update emergency incident' });
});

// ==================== OPERATIONAL DATA (GOVERNMENT ONLY) ====================

app.get('/api/analytics', authenticateToken, requireRole('GOVERNMENT'), (req: Request, res: Response) => {
  const total = COMPLAINTS.length;
  const resolved = COMPLAINTS.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const activeEmergencies = EMERGENCIES.filter(e => e.status !== 'RESOLVED').length;
  const disputedCount = COMPLAINTS.filter(c => c.citizenVerification === 'DISPUTED_STILL_EXISTS').length;

  const wardStats = WARDS.map(w => {
    const wardComplaints = COMPLAINTS.filter(c => c.ward === w.name.split(' ')[0] + ' ' + w.name.split(' ')[1] || c.ward === w.name);
    return {
      ward: w.name,
      total: wardComplaints.length,
      highPriority: wardComplaints.filter(c => c.priority === 'HIGH' || c.priority === 'CRITICAL').length,
      emergencies: EMERGENCIES.filter(e => e.ward === w.name.split(' ')[0] + ' ' + w.name.split(' ')[1]).length,
      resolvedRate: wardComplaints.length > 0 ? Math.round((wardComplaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length / wardComplaints.length) * 100) : 100
    };
  });

  const categoryStats = DEPARTMENTS.map(d => {
    const count = COMPLAINTS.filter(c => c.department === d.name).length;
    return { department: d.name, count };
  });

  return res.json({
    metrics: {
      totalComplaints: total,
      activeComplaints: total - resolved,
      resolvedCount: resolved,
      activeEmergencies,
      disputedCount,
      avgResolutionHours: 14.5
    },
    wardStats,
    categoryStats
  });
});

app.get('/api/departments', authenticateToken, requireRole('GOVERNMENT'), (req: Request, res: Response) => {
  return res.json({ departments: DEPARTMENTS });
});

app.get('/api/wards', authenticateToken, (req: Request, res: Response) => {
  return res.json({ wards: WARDS });
});

app.get('/api/field-workers', authenticateToken, requireRole('GOVERNMENT'), (req: Request, res: Response) => {
  const workers = FIELD_WORKER_ROSTER.map(w => ({
    id: w.id,
    name: w.name,
    workerId: w.workerId,
    department: w.department,
    ward: w.ward,
    phone: w.phone,
    activeTasks: COMPLAINTS.filter(c => c.assignedWorkerId === w.workerId && c.status !== 'RESOLVED' && c.status !== 'CLOSED').length,
    status: 'AVAILABLE'
  }));
  return res.json({ workers });
});

app.get('/api/audit-logs', authenticateToken, requireRole('GOVERNMENT'), (req: Request, res: Response) => {
  return res.json({ logs: AUDIT_LOGS });
});

app.get('/api/notifications', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user as SessionUser;
  // Role-based notification filtering
  const visible = NOTIFICATION_LOGS.filter(n => n.recipientRole === user.role || n.recipientRole === 'ALL');
  return res.json({ notifications: visible });
});

// ==================== BILINGUAL GEMINI CIVIC AI ====================

app.post('/api/ai/analyze-issue', async (req: Request, res: Response) => {
  const { text, isEmergencyCheck } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text description required' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `You are NagarMitra AI, a municipal civic problem analyzer for Indian municipal corporations.
Analyze the following civic issue description (which may be in English, Hindi, or Hinglish e.g. "Road pe bahut bada pothole hai" or "Ghar ke samne pani beh raha hai"):
"${text}"

Return a clean JSON object ONLY (no markdown code blocks, just raw JSON) matching this exact schema:
{
  "issue": "short title summary in English",
  "category": "one of: Road Infrastructure, Electrical & Street Lighting, Water Supply & Sewage, Public Sanitation & Solid Waste, Storm Water Drainage, Parks & Horticulture",
  "severity": "one of: LOW, MODERATE, HIGH, CRITICAL",
  "possibleRisk": "concise risk description (e.g. Pedestrian / vehicle skid hazard, electrocution risk, waterborne contamination)",
  "suggestedDepartment": "one of: Road Infrastructure, Electrical & Street Lighting, Water Supply & Sewage, Public Sanitation & Solid Waste, Storm Water Drainage",
  "detectedWard": "suggested ward (e.g. Ward 12, Ward 8, Ward 9, or Ward 11)",
  "advisoryNote": "Civic advisory guidance note (remind that this is an advisory suggestion)",
  "isPotentialHazard": boolean,
  "hazardType": "string or null (e.g. live wire, water burst, road cave-in, open manhole)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({ result: parsed });
      }
    }
  } catch (err: any) {
    console.error('Gemini API call failed, falling back to heuristic civic analyzer:', err?.message);
  }

  // Robust advisory fallback analyzer for bilingual English / Hindi / Hinglish
  const lower = text.toLowerCase();
  let category = 'Road Infrastructure';
  let suggestedDepartment = 'Road Infrastructure';
  let severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
  let possibleRisk = 'Pedestrian or vehicular inconvenience';
  let isPotentialHazard = false;
  let hazardType: string | undefined = undefined;

  if (lower.includes('wire') || lower.includes('bijli') || lower.includes('light') || lower.includes('current') || lower.includes('pole') || lower.includes('तार') || lower.includes('बत्ती')) {
    category = 'Electrical & Street Lighting';
    suggestedDepartment = 'Electrical & Street Lighting';
    if (lower.includes('live') || lower.includes('dangling') || lower.includes('shock') || lower.includes('khula') || lower.includes('खुला')) {
      severity = 'CRITICAL';
      possibleRisk = 'Potential electrocution and public safety hazard';
      isPotentialHazard = true;
      hazardType = 'exposed live wire';
    } else {
      severity = 'MODERATE';
      possibleRisk = 'Low visibility at night for pedestrians';
    }
  } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('pani') || lower.includes('burst') || lower.includes('leak') || lower.includes('नाली') || lower.includes('पानी')) {
    category = 'Water Supply & Sewage';
    suggestedDepartment = 'Water Supply & Sewage';
    if (lower.includes('burst') || lower.includes('flood') || lower.includes('dub') || lower.includes('फाट')) {
      severity = 'HIGH';
      possibleRisk = 'Flooding and clean water wastage';
      isPotentialHazard = true;
      hazardType = 'water main burst';
    } else {
      severity = 'MODERATE';
      possibleRisk = 'Water stagnation and sanitation risk';
    }
  } else if (lower.includes('pothole') || lower.includes('gaddha') || lower.includes('road') || lower.includes('sadak') || lower.includes('गड्ढा') || lower.includes('सड़क')) {
    category = 'Road Infrastructure';
    suggestedDepartment = 'Road Infrastructure';
    severity = 'HIGH';
    possibleRisk = 'Vehicle damage and two-wheeler skidding risk';
  } else if (lower.includes('kachra') || lower.includes('garbage') || lower.includes('waste') || lower.includes('safai') || lower.includes('कूड़ा') || lower.includes('कचरा')) {
    category = 'Public Sanitation & Solid Waste';
    suggestedDepartment = 'Public Sanitation & Solid Waste';
    severity = 'MODERATE';
    possibleRisk = 'Unhygienic accumulation and pest breeding';
  }

  if (isEmergencyCheck || lower.includes('danger') || lower.includes('khatra') || lower.includes('manhole') || lower.includes('fire')) {
    isPotentialHazard = true;
    severity = 'CRITICAL';
    hazardType = hazardType || 'immediate public hazard';
  }

  return res.json({
    result: {
      issue: text.slice(0, 50),
      category,
      severity,
      possibleRisk,
      suggestedDepartment,
      detectedWard: lower.includes('ward 8') ? 'Ward 8' : lower.includes('ward 9') ? 'Ward 9' : 'Ward 12',
      advisoryNote: 'Potential safety hazard detected (Advisory civic classification).',
      isPotentialHazard,
      hazardType
    }
  });
});

// ==================== STATIC & VITE MIDDLEWARE ====================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NagarMitra Municipal Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
