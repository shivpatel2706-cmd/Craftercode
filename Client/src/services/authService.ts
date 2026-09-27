import { apiClient, requestWithFallback } from './api';
import { storage } from './storage';
import { User, UserRole } from '../types/user';

export const authService = {
  async login(email: string, _password?: string): Promise<{ user: User; token: string }> {
    const result = await requestWithFallback(
      () => apiClient.post('/auth/login', { email, password: _password || 'Metro@123' }),
      () => {
        const users = storage.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        const user = found || users[0];
        const token = `mock-jwt-token-${user.role}-${Date.now()}`;
        return { user, token };
      }
    );

    if (result?.token) {
      localStorage.setItem('metroverify_token', result.token);
    }
    if (result?.user) {
      storage.setCurrentUser(result.user);
    }
    return result;
  },

  async loginAs(role: UserRole): Promise<{ user: User; token: string }> {
    const emailMap: Record<UserRole, string> = {
      'admin': 'admin@metroverify.gov.in',
      'officer': 'officer@metroverify.gov.in',
      'applicant': 'applicant@metroverify.gov.in'
    };

    const email = emailMap[role] || `${role.toLowerCase()}@metroverify.gov.in`;
    return this.login(email, 'Metro@123');
  },

  logout(): void {
    localStorage.removeItem('metroverify_token');
    // Note: currentUser state can remain or reset to applicant
  },

  getCurrentUser(): User {
    return storage.getCurrentUser();
  }
};
