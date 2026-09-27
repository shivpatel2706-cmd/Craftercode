import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { Application, TrackingStep } from '../types/application';
import { Certificate } from '../types/certificate';

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    return requestWithFallback(
      () => apiClient.get('/applications'),
      () => storage.getApplications()
    );
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    return requestWithFallback(
      () => apiClient.get(`/applications/${id}`),
      () => storage.getApplicationById(id)
    );
  },

  async createApplication(data: {
    instrumentId: string;
    instrumentName: string;
    instrumentType: string;
    serialNumber: string;
    capacity: string;
    location: string;
    ownerId: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail: string;
    priority?: 'Normal' | 'High' | 'Urgent';
    feeAmount?: number;
  }): Promise<Application> {
    return requestWithFallback(
      () => apiClient.post('/applications', data),
      () => {
        const id = `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const trackingSteps: TrackingStep[] = [
          {
            stepNumber: 1,
            title: 'Application Submitted',
            description: 'Online verification filing completed with preliminary validation.',
            status: 'Completed',
            date: `${dateStr} ${timeStr}`,
            actor: data.ownerName
          },
          {
            stepNumber: 2,
            title: 'Application Reviewed',
            description: 'Desk scrutiny by Legal Metrology inspectorate.',
            status: 'Current',
            date: `${dateStr} ${timeStr}`,
            actor: 'Legal Metrology Desk'
          },
          { stepNumber: 3, title: 'Officer Assigned', description: 'Designated field officer allocation.', status: 'Pending' },
          { stepNumber: 4, title: 'Inspection Scheduled', description: 'Field testing date determination.', status: 'Pending' },
          { stepNumber: 5, title: 'Field Inspection', description: 'Metrological verification with reference standards.', status: 'Pending' },
          { stepNumber: 6, title: 'Verification Completed', description: 'NAWI statutory test data recording.', status: 'Pending' },
          { stepNumber: 7, title: 'Digital Approval', description: 'Controller evaluation and digital authorization.', status: 'Pending' },
          { stepNumber: 8, title: 'Certificate Generated', description: 'Issue of Official QR Certificate.', status: 'Pending' }
        ];

        const newApp: Application = {
          id,
          instrumentId: data.instrumentId,
          instrumentName: data.instrumentName,
          instrumentType: data.instrumentType,
          serialNumber: data.serialNumber,
          capacity: data.capacity,
          location: data.location,
          ownerId: data.ownerId,
          ownerName: data.ownerName,
          ownerPhone: data.ownerPhone,
          ownerEmail: data.ownerEmail,
          applicationDate: dateStr,
          priority: data.priority || 'Normal',
          status: 'Pending',
          feeAmount: data.feeAmount || 1000,
          paymentStatus: 'Paid',
          trackingSteps,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        storage.saveApplication(newApp);
        storage.addAuditLog({
          userName: data.ownerName,
          userRole: 'Applicant',
          action: 'APPLICATION_FILED',
          entityType: 'Application',
          entityId: id,
          details: `Verification application filed for ${data.instrumentName} (${data.serialNumber})`,
          ipAddress: '115.112.44.89',
          status: 'SUCCESS'
        });

        return newApp;
      }
    );
  },

  async assignOfficer(appId: string, officerId: string, scheduledDate?: string): Promise<Application | undefined> {
    return requestWithFallback(
      () => apiClient.post(`/applications/${appId}/assign`, { officerId, scheduledDate }),
      () => storage.assignOfficer(appId, officerId, scheduledDate)
    );
  },

  async approveApplication(appId: string, approvalNotes?: string): Promise<{ application: Application; certificate: Certificate }> {
    return requestWithFallback(
      () => apiClient.post(`/applications/${appId}/approve`, { approvalNotes }),
      () => storage.approveApplication(appId, approvalNotes)
    );
  },

  async rejectApplication(appId: string, reason: string): Promise<Application> {
    return requestWithFallback(
      () => apiClient.post(`/applications/${appId}/reject`, { reason }),
      () => storage.rejectApplication(appId, reason)
    );
  }
};
