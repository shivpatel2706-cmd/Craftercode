import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { Instrument } from '../types/instrument';

export const instrumentService = {
  async getInstruments(): Promise<Instrument[]> {
    return requestWithFallback(
      () => apiClient.get('/instruments'),
      () => storage.getInstruments()
    );
  },

  async getInstrumentById(id: string): Promise<Instrument | undefined> {
    return requestWithFallback(
      () => apiClient.get(`/instruments/${id}`),
      () => storage.getInstrumentById(id)
    );
  },

  async createInstrument(data: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: Instrument['status'] }): Promise<Instrument> {
    return requestWithFallback(
      () => apiClient.post('/instruments', data),
      () => {
        const id = `INST-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        const now = new Date().toISOString();
        const newInst: Instrument = {
          ...data,
          id,
          status: data.status || 'Under Verification',
          createdAt: now,
          updatedAt: now
        };
        storage.saveInstrument(newInst);
        storage.addAuditLog({
          userName: data.ownerName,
          userRole: 'Applicant',
          action: 'INSTRUMENT_REGISTERED',
          entityType: 'Instrument',
          entityId: id,
          details: `Registered new instrument: ${data.name} (${data.type})`,
          ipAddress: '115.112.44.89',
          status: 'SUCCESS'
        });
        return newInst;
      }
    );
  },

  async updateInstrument(id: string, data: Partial<Instrument>): Promise<Instrument> {
    return requestWithFallback(
      () => apiClient.put(`/instruments/${id}`, data),
      () => {
        const existing = storage.getInstrumentById(id);
        if (!existing) throw new Error('Instrument not found');
        const updated: Instrument = {
          ...existing,
          ...data,
          updatedAt: new Date().toISOString()
        };
        storage.saveInstrument(updated);
        return updated;
      }
    );
  }
};
