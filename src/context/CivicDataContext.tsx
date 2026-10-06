import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Complaint, EmergencyIncident, Department, Ward, FieldWorkerRecord, AuditLog, NotificationLog } from '../types';
import { useAuth } from './AuthContext';

interface CivicDataContextType {
  complaints: Complaint[];
  nearbyComplaints: Complaint[];
  emergencies: EmergencyIncident[];
  departments: Department[];
  wards: Ward[];
  fieldWorkers: FieldWorkerRecord[];
  auditLogs: AuditLog[];
  notifications: NotificationLog[];
  analytics: any | null;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  createComplaint: (data: Partial<Complaint>) => Promise<{ success: boolean; complaint?: Complaint; error?: string }>;
  verifyComplaint: (id: string, state: 'VERIFIED_FIXED' | 'DISPUTED_STILL_EXISTS') => Promise<boolean>;
  updateGovernmentComplaint: (id: string, updates: Partial<Complaint> & { internalNote?: string }) => Promise<boolean>;
  updateFieldWorkerTask: (id: string, updates: Partial<Complaint>) => Promise<boolean>;
  updateEmergencyStatus: (id: string, updates: Partial<EmergencyIncident>) => Promise<boolean>;
  createEmergency: (data: Partial<EmergencyIncident>) => Promise<{ success: boolean; emergency?: EmergencyIncident; error?: string }>;
}

const CivicDataContext = createContext<CivicDataContextType>({
  complaints: [],
  nearbyComplaints: [],
  emergencies: [],
  departments: [],
  wards: [],
  fieldWorkers: [],
  auditLogs: [],
  notifications: [],
  analytics: null,
  isLoadingData: false,
  refreshData: async () => {},
  createComplaint: async () => ({ success: false }),
  verifyComplaint: async () => false,
  updateGovernmentComplaint: async () => false,
  updateFieldWorkerTask: async () => false,
  updateEmergencyStatus: async () => false,
  createEmergency: async () => ({ success: false }),
});

export const CivicDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [nearbyComplaints, setNearbyComplaints] = useState<Complaint[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [fieldWorkers, setFieldWorkers] = useState<FieldWorkerRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const refreshData = useCallback(async () => {
    if (!token || !user) return;
    setIsLoadingData(true);

    const headers = { Authorization: `Bearer ${token}` };

    try {
      // Common: fetch complaints according to user role
      const compRes = await fetch('/api/complaints', { headers });
      if (compRes.ok) {
        const cData = await compRes.json();
        setComplaints(cData.complaints || []);
      }

      // If Citizen: also fetch nearby public civic issues
      if (user.role === 'CITIZEN') {
        const nearbyRes = await fetch('/api/complaints?view=nearby', { headers });
        if (nearbyRes.ok) {
          const nData = await nearbyRes.json();
          setNearbyComplaints(nData.complaints || []);
        }
      }

      // If Field Worker or Government: fetch emergencies
      if (user.role === 'GOVERNMENT' || user.role === 'FIELD_WORKER') {
        const emerRes = await fetch('/api/emergencies', { headers });
        if (emerRes.ok) {
          const eData = await emerRes.json();
          setEmergencies(eData.emergencies || []);
        }
      }

      // If Government: fetch municipal operational data
      if (user.role === 'GOVERNMENT') {
        const [deptRes, wardRes, workerRes, auditRes, analyticsRes] = await Promise.all([
          fetch('/api/departments', { headers }),
          fetch('/api/wards', { headers }),
          fetch('/api/field-workers', { headers }),
          fetch('/api/audit-logs', { headers }),
          fetch('/api/analytics', { headers }),
        ]);

        if (deptRes.ok) {
          const dData = await deptRes.json();
          setDepartments(dData.departments || []);
        }
        if (wardRes.ok) {
          const wData = await wardRes.json();
          setWards(wData.wards || []);
        }
        if (workerRes.ok) {
          const wrkData = await workerRes.json();
          setFieldWorkers(wrkData.workers || []);
        }
        if (auditRes.ok) {
          const aData = await auditRes.json();
          setAuditLogs(aData.logs || []);
        }
        if (analyticsRes.ok) {
          const anData = await analyticsRes.json();
          setAnalytics(anData);
        }
      }

      // Notifications
      const notifRes = await fetch('/api/notifications', { headers });
      if (notifRes.ok) {
        const nData = await notifRes.json();
        setNotifications(nData.notifications || []);
      }
    } catch (err) {
      console.error('Error refreshing civic data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (user && token) {
      refreshData();
    } else {
      setComplaints([]);
      setNearbyComplaints([]);
      setEmergencies([]);
      setDepartments([]);
      setWards([]);
      setFieldWorkers([]);
      setAuditLogs([]);
      setNotifications([]);
      setAnalytics(null);
    }
  }, [user, token, refreshData]);

  const createComplaint = async (data: Partial<Complaint>) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to submit complaint' };
      }
      await refreshData();
      return { success: true, complaint: resData.complaint };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const verifyComplaint = async (id: string, state: 'VERIFIED_FIXED' | 'DISPUTED_STILL_EXISTS') => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ citizenVerification: state })
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateGovernmentComplaint = async (id: string, updates: Partial<Complaint> & { internalNote?: string }) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateFieldWorkerTask = async (id: string, updates: Partial<Complaint>) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateEmergencyStatus = async (id: string, updates: Partial<EmergencyIncident>) => {
    if (!token) return false;
    try {
      const res = await fetch(`/api/emergencies/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await refreshData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const createEmergency = async (data: Partial<EmergencyIncident>) => {
    if (!token) return { success: false, error: 'Unauthorized' };
    try {
      const res = await fetch('/api/emergencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Failed to trigger emergency alert' };
      }
      await refreshData();
      return { success: true, emergency: resData.emergency };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <CivicDataContext.Provider
      value={{
        complaints,
        nearbyComplaints,
        emergencies,
        departments,
        wards,
        fieldWorkers,
        auditLogs,
        notifications,
        analytics,
        isLoadingData,
        refreshData,
        createComplaint,
        verifyComplaint,
        updateGovernmentComplaint,
        updateFieldWorkerTask,
        updateEmergencyStatus,
        createEmergency
      }}
    >
      {children}
    </CivicDataContext.Provider>
  );
};

export const useCivicData = () => useContext(CivicDataContext);
