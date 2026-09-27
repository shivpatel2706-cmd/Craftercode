import {
  INITIAL_USERS,
  INITIAL_INSTRUMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_INSPECTIONS,
  INITIAL_CERTIFICATES,
  INITIAL_RENEWAL_ALERTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './mockData';
import { User } from '../types/user';
import { Instrument } from '../types/instrument';
import { Application, TrackingStep } from '../types/application';
import { Inspection } from '../types/inspection';
import { Certificate } from '../types/certificate';
import { Notification, RenewalAlert, AuditLog } from '../types/notification';

const KEYS = {
  USERS: 'metroverify_users_v1',
  INSTRUMENTS: 'metroverify_instruments_v1',
  APPLICATIONS: 'metroverify_applications_v1',
  INSPECTIONS: 'metroverify_inspections_v1',
  CERTIFICATES: 'metroverify_certificates_v1',
  RENEWAL_ALERTS: 'metroverify_renewals_v1',
  NOTIFICATIONS: 'metroverify_notifications_v1',
  AUDIT_LOGS: 'metroverify_audit_logs_v1',
  CURRENT_USER: 'metroverify_current_user_v1'
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Storage error for key ${key}:`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to set storage key ${key}:`, e);
  }
}

export const storage = {
  // Current user / Auth
  getCurrentUser(): User {
    return getStoredItem<User>(KEYS.CURRENT_USER, INITIAL_USERS[0]);
  },
  setCurrentUser(user: User): void {
    setStoredItem(KEYS.CURRENT_USER, user);
  },

  // Users
  getUsers(): User[] {
    return getStoredItem<User[]>(KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },
  saveUser(user: User): void {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx >= 0) list[idx] = user;
    else list.push(user);
    setStoredItem(KEYS.USERS, list);
  },

  // Instruments
  getInstruments(): Instrument[] {
    return getStoredItem<Instrument[]>(KEYS.INSTRUMENTS, INITIAL_INSTRUMENTS);
  },
  getInstrumentById(id: string): Instrument | undefined {
    return this.getInstruments().find(i => i.id === id);
  },
  saveInstrument(inst: Instrument): void {
    const list = this.getInstruments();
    const idx = list.findIndex(i => i.id === inst.id);
    if (idx >= 0) list[idx] = inst;
    else list.unshift(inst);
    setStoredItem(KEYS.INSTRUMENTS, list);
  },

  // Applications
  getApplications(): Application[] {
    return getStoredItem<Application[]>(KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  },
  getApplicationById(id: string): Application | undefined {
    return this.getApplications().find(a => a.id === id);
  },
  saveApplication(app: Application): void {
    const list = this.getApplications();
    const idx = list.findIndex(a => a.id === app.id);
    if (idx >= 0) list[idx] = app;
    else list.unshift(app);
    setStoredItem(KEYS.APPLICATIONS, list);
  },

  // Inspections
  getInspections(): Inspection[] {
    return getStoredItem<Inspection[]>(KEYS.INSPECTIONS, INITIAL_INSPECTIONS);
  },
  getInspectionById(id: string): Inspection | undefined {
    return this.getInspections().find(i => i.id === id);
  },
  saveInspection(insp: Inspection): void {
    const list = this.getInspections();
    const idx = list.findIndex(i => i.id === insp.id);
    if (idx >= 0) list[idx] = insp;
    else list.unshift(insp);
    setStoredItem(KEYS.INSPECTIONS, list);
  },

  // Certificates
  getCertificates(): Certificate[] {
    return getStoredItem<Certificate[]>(KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  },
  getCertificateByNumber(certNumber: string): Certificate | undefined {
    const norm = certNumber.trim().toUpperCase();
    return this.getCertificates().find(c => c.certificateNumber.toUpperCase() === norm);
  },
  getCertificateById(id: string): Certificate | undefined {
    return this.getCertificates().find(c => c.id === id);
  },
  saveCertificate(cert: Certificate): void {
    const list = this.getCertificates();
    const idx = list.findIndex(c => c.id === cert.id);
    if (idx >= 0) list[idx] = cert;
    else list.unshift(cert);
    setStoredItem(KEYS.CERTIFICATES, list);
  },

  // Renewal Alerts
  getRenewalAlerts(): RenewalAlert[] {
    return getStoredItem<RenewalAlert[]>(KEYS.RENEWAL_ALERTS, INITIAL_RENEWAL_ALERTS);
  },

  // Notifications
  getNotifications(): Notification[] {
    return getStoredItem<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      setStoredItem(KEYS.NOTIFICATIONS, list);
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const now = new Date();
    const newEntry: AuditLog = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
    };
    logs.unshift(newEntry);
    setStoredItem(KEYS.AUDIT_LOGS, logs);
  },

  // High-level Workflows
  assignOfficer(appId: string, officerId: string, scheduledDate?: string): Application | undefined {
    const app = this.getApplicationById(appId);
    const officer = this.getUserById(officerId);
    if (!app || !officer) return undefined;

    app.officerId = officer.id;
    app.officerName = officer.name;
    app.officerBadge = officer.badgeNumber || 'LMI-DL-2024';
    app.status = scheduledDate ? 'Inspection Scheduled' : 'Assigned';
    if (scheduledDate) {
      app.inspectionScheduledDate = scheduledDate;
    }
    app.updatedAt = new Date().toISOString();

    // Update tracking steps
    const step3 = app.trackingSteps.find(s => s.stepNumber === 3);
    if (step3) {
      step3.status = 'Completed';
      step3.date = new Date().toLocaleString();
      step3.actor = officer.name;
      step3.description = `Assigned to ${officer.name} (${officer.badgeNumber || 'Officer'}).`;
    }
    const step4 = app.trackingSteps.find(s => s.stepNumber === 4);
    if (step4) {
      step4.status = scheduledDate ? 'Completed' : 'Current';
      if (scheduledDate) {
        step4.date = scheduledDate;
        step4.description = `Inspection confirmed on ${scheduledDate}.`;
      }
    }
    const step5 = app.trackingSteps.find(s => s.stepNumber === 5);
    if (step5 && scheduledDate) {
      step5.status = 'Current';
    }

    this.saveApplication(app);
    this.addAuditLog({
      userName: 'Administrator',
      userRole: 'Administrator',
      action: 'OFFICER_ASSIGNED',
      entityType: 'Application',
      entityId: app.id,
      details: `Assigned inspection to ${officer.name} for ${app.instrumentName}`,
      ipAddress: '10.14.22.105',
      status: 'SUCCESS'
    });

    return app;
  },

  submitFieldInspection(inspection: Inspection): { inspection: Inspection; application: Application } {
    this.saveInspection(inspection);
    const app = this.getApplicationById(inspection.applicationId);
    if (app) {
      app.inspectionId = inspection.id;
      app.inspectionCompletedDate = inspection.inspectionDate;
      app.status = 'Inspection Completed';
      app.updatedAt = new Date().toISOString();

      // Tracking steps
      const step5 = app.trackingSteps.find(s => s.stepNumber === 5);
      if (step5) {
        step5.status = 'Completed';
        step5.date = inspection.inspectionDate;
        step5.description = `Field inspection performed. Result: ${inspection.result}.`;
      }
      const step6 = app.trackingSteps.find(s => s.stepNumber === 6);
      if (step6) {
        step6.status = 'Completed';
        step6.date = inspection.inspectionDate;
        step6.description = `NAWI test dossiers filed by ${inspection.officerName}.`;
      }
      const step7 = app.trackingSteps.find(s => s.stepNumber === 7);
      if (step7) {
        step7.status = 'Current';
        step7.description = 'Queued for Controller digital scrutiny & sign-off.';
      }
      this.saveApplication(app);
    }

    this.addAuditLog({
      userName: inspection.officerName,
      userRole: 'Verification Officer',
      action: 'FIELD_INSPECTION_SUBMITTED',
      entityType: 'Inspection',
      entityId: inspection.id,
      details: `Inspection conducted for ${app?.instrumentName || 'Instrument'}. Result: ${inspection.result}.`,
      ipAddress: '49.36.110.21',
      status: 'SUCCESS'
    });

    return { inspection, application: app! };
  },

  approveApplication(appId: string, approvalNotes?: string): { application: Application; certificate: Certificate } {
    const app = this.getApplicationById(appId);
    if (!app) throw new Error('Application not found');

    const inst = this.getInstrumentById(app.instrumentId);
    const today = new Date().toISOString().split('T')[0];
    const expiryYear = new Date().getFullYear() + 1;
    const expiryDate = `${expiryYear}-${new Date().toISOString().substring(5, 10)}`;

    const certNumber = `MV-CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const certId = `CERT-${Date.now().toString().slice(-4)}`;

    const newCert: Certificate = {
      id: certId,
      certificateNumber: certNumber,
      applicationId: app.id,
      instrumentId: app.instrumentId,
      instrumentName: app.instrumentName,
      instrumentType: app.instrumentType,
      capacity: app.capacity,
      accuracyClass: inst?.accuracyClass || 'Class III (Medium)',
      serialNumber: app.serialNumber,
      manufacturer: inst?.manufacturer || 'Verified Manufacturer',
      modelNumber: inst?.modelNumber || 'Standard Model',
      ownerId: app.ownerId,
      ownerName: app.ownerName,
      ownerAddress: inst?.ownerAddress || 'Registered Commercial Premises',
      installationLocation: app.location,
      verificationDate: today,
      expiryDate: expiryDate,
      officerId: app.officerId || 'usr_officer_1',
      officerName: app.officerName || 'Inspector S. K. Verma',
      officerBadge: app.officerBadge || 'LMI-DL-2018-044',
      issuingAuthority: 'Department of Legal Metrology, Government of NCT of Delhi',
      jurisdictionZone: 'Central & State Metrology Division',
      sealTagNumber: `DL-LM-SEAL-${Math.floor(10000 + Math.random() * 90000)}`,
      verificationFeePaid: app.feeAmount,
      status: 'VALID',
      digitalSignatureHash: `SHA256:${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      verificationUrl: `/verify/${certNumber}`,
      qrPayload: `https://metroverify360.gov.in/verify/${certNumber}`,
      createdAt: new Date().toISOString()
    };

    this.saveCertificate(newCert);

    // Update Application
    app.status = 'Approved';
    app.approvalDate = today;
    app.certificateId = newCert.id;
    app.certificateNumber = newCert.certificateNumber;
    app.updatedAt = new Date().toISOString();

    const step7 = app.trackingSteps.find(s => s.stepNumber === 7);
    if (step7) {
      step7.status = 'Completed';
      step7.date = new Date().toLocaleString();
      step7.actor = 'Dr. A. Ramanathan (Controller)';
      step7.description = approvalNotes || 'Application scrutiny approved.';
    }
    const step8 = app.trackingSteps.find(s => s.stepNumber === 8);
    if (step8) {
      step8.status = 'Completed';
      step8.date = new Date().toLocaleString();
      step8.description = `Digital QR Certificate ${certNumber} issued.`;
    }
    this.saveApplication(app);

    // Update Instrument
    if (inst) {
      inst.status = 'Active';
      inst.currentCertificateId = newCert.id;
      inst.previousCertificateNumber = certNumber;
      inst.previousVerificationDate = today;
      inst.expiryDate = expiryDate;
      this.saveInstrument(inst);
    }

    // Add Audit Log
    this.addAuditLog({
      userName: 'Dr. A. Ramanathan (Controller)',
      userRole: 'Administrator',
      action: 'APPLICATION_APPROVED_CERTIFICATE_ISSUED',
      entityType: 'Certificate',
      entityId: newCert.certificateNumber,
      details: `Approved verification for ${app.instrumentName}. Issued Certificate ${certNumber}.`,
      ipAddress: '10.14.22.105',
      status: 'SUCCESS'
    });

    return { application: app, certificate: newCert };
  },

  rejectApplication(appId: string, reason: string): Application {
    const app = this.getApplicationById(appId);
    if (!app) throw new Error('Application not found');

    app.status = 'Rejected';
    app.rejectionReason = reason;
    app.updatedAt = new Date().toISOString();

    const step7 = app.trackingSteps.find(s => s.stepNumber === 7);
    if (step7) {
      step7.status = 'Completed';
      step7.description = `Rejected: ${reason}`;
      step7.date = new Date().toLocaleString();
    }
    this.saveApplication(app);

    this.addAuditLog({
      userName: 'Dr. A. Ramanathan (Controller)',
      userRole: 'Administrator',
      action: 'APPLICATION_REJECTED',
      entityType: 'Application',
      entityId: app.id,
      details: `Application rejected. Reason: ${reason}`,
      ipAddress: '10.14.22.105',
      status: 'WARNING'
    });

    return app;
  },

  resetDefaults(): void {
    localStorage.removeItem(KEYS.USERS);
    localStorage.removeItem(KEYS.INSTRUMENTS);
    localStorage.removeItem(KEYS.APPLICATIONS);
    localStorage.removeItem(KEYS.INSPECTIONS);
    localStorage.removeItem(KEYS.CERTIFICATES);
    localStorage.removeItem(KEYS.RENEWAL_ALERTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};
