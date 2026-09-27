export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface RenewalAlert {
  id: string;
  certificateNumber: string;
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  serialNumber: string;
  ownerName: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'Expiring Soon' | 'Due Immediately' | 'Expired';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Application' | 'Instrument' | 'Inspection' | 'Certificate' | 'Officer' | 'User';
  entityId: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}
