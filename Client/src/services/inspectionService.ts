import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { Inspection } from '../types/inspection';
import { Application } from '../types/application';

export const inspectionService = {
  async getInspections(): Promise<Inspection[]> {
    return requestWithFallback(
      () => apiClient.get('/inspections'),
      () => storage.getInspections()
    );
  },

  async getInspectionById(id: string): Promise<Inspection | undefined> {
    return requestWithFallback(
      () => apiClient.get(`/inspections/${id}`),
      () => storage.getInspectionById(id)
    );
  },

  async submitInspection(inspectionData: Omit<Inspection, 'id' | 'status'> & { id?: string }): Promise<{ inspection: Inspection; application: Application }> {
    return requestWithFallback(
      () => apiClient.post('/inspections', inspectionData),
      () => {
        const id = inspectionData.id || `INSP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const inspection: Inspection = {
          ...inspectionData,
          id,
          status: 'Submitted',
          submittedAt: new Date().toISOString()
        };
        return storage.submitFieldInspection(inspection);
      }
    );
  },

  async saveDraftInspection(inspectionData: Omit<Inspection, 'id' | 'status'> & { id?: string }): Promise<Inspection> {
    const id = inspectionData.id || `INSP-DRAFT-${Math.floor(100 + Math.random() * 900)}`;
    const inspection: Inspection = {
      ...inspectionData,
      id,
      status: 'Draft'
    };
    storage.saveInspection(inspection);
    return inspection;
  }
};
