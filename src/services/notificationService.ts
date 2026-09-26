import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { Notification, RenewalAlert } from '../types/notification';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return requestWithFallback(
      () => apiClient.get('/notifications'),
      () => storage.getNotifications()
    );
  },

  async getRenewalAlerts(): Promise<RenewalAlert[]> {
    return requestWithFallback(
      () => apiClient.get('/notifications/renewals'),
      () => storage.getRenewalAlerts()
    );
  },

  async markAsRead(id: string): Promise<void> {
    storage.markNotificationRead(id);
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      // offline fallback
    }
  }
};
