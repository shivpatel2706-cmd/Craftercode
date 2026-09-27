export type ApplicationStatus = 
  | 'Pending'
  | 'Assigned'
  | 'Inspection Scheduled'
  | 'Inspection Completed'
  | 'Approved'
  | 'Rejected';

export type TrackingStepStatus = 'Completed' | 'Current' | 'Pending';

export interface TrackingStep {
  stepNumber: number;
  title: string;
  description: string;
  status: TrackingStepStatus;
  date?: string;
  actor?: string;
  note?: string;
}

export interface Application {
  id: string; // e.g. "APP-2026-0842"
  instrumentId: string;
  instrumentName: string;
  instrumentType: string;
  serialNumber: string;
  capacity: string;
  location: string;
  
  // Owner info
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;

  // Dates
  applicationDate: string;
  inspectionScheduledDate?: string;
  inspectionCompletedDate?: string;
  approvalDate?: string;

  // Officer info
  officerId?: string;
  officerName?: string;
  officerBadge?: string;
  priority: 'Normal' | 'High' | 'Urgent';

  status: ApplicationStatus;
  inspectionId?: string;
  certificateId?: string;
  certificateNumber?: string;
  rejectionReason?: string;
  feeAmount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Exempt';

  trackingSteps: TrackingStep[];
  createdAt: string;
  updatedAt: string;
}
