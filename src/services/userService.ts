import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { User } from '../types/user';
import { AuditLog } from '../types/notification';

export const userService = {
  async getUsers(): Promise<User[]> {
    return requestWithFallback(
      () => apiClient.get('/users'),
      () => storage.getUsers()
    );
  },

  async getOfficers(): Promise<User[]> {
    return requestWithFallback(
      () => apiClient.get('/users/officers'),
      () => storage.getUsers().filter(u => u.role === 'officer')
    );
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return requestWithFallback(
      () => apiClient.get('/audit-logs'),
      () => storage.getAuditLogs()
    );
  },

  async toggleUserStatus(userId: string): Promise<User | undefined> {
    const user = storage.getUserById(userId);
    if (!user) return undefined;
    storage.saveUser(user);
    return user;
  }
};
