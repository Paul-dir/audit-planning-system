/**
 * User Management API Client
 * Consumes the MOR Enterprise User Management API
 * Base URL: https://localhost:8080 (dev) or production URL
 */

const API_BASE_URL = import.meta.env.VITE_USER_MANAGEMENT_API_URL || 'https://localhost:8080';

class UserManagementClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.authContext = null;
  }

  // Helper: Make API calls with envelope handling
  async request(method, endpoint, body = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      // Handle API envelope: { data, error, meta }
      if (result.error && result.error.message) {
        throw new Error(result.error.message);
      }

      return result.data;
    } catch (err) {
      console.error(`API Error [${method} ${endpoint}]:`, err.message);
      throw err;
    }
  }

  // ============ AUTH ============
  async login(email) {
    const data = await this.request('POST', '/api/public/v1/auth/login', { email });
    this.authContext = data;
    // Store in localStorage for persistence
    localStorage.setItem('auth_context', JSON.stringify(data));
    return data;
  }

  async getMe(userId) {
    const data = await this.request('GET', `/api/public/v1/auth/me?userId=${userId}`);
    this.authContext = data;
    localStorage.setItem('auth_context', JSON.stringify(data));
    return data;
  }

  getStoredAuthContext() {
    const stored = localStorage.getItem('auth_context');
    if (stored) {
      this.authContext = JSON.parse(stored);
      return this.authContext;
    }
    return null;
  }

  clearAuthContext() {
    this.authContext = null;
    localStorage.removeItem('auth_context');
  }

  // ============ USERS ============
  async listUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.region) params.append('region', filters.region);
    if (filters.taxCenter) params.append('taxCenter', filters.taxCenter);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    return this.request('GET', `/api/public/v1/users${queryString ? '?' + queryString : ''}`);
  }

  async getUser(userId) {
    return this.request('GET', `/api/public/v1/users/${userId}`);
  }

  async createUser(userData) {
    return this.request('POST', '/api/public/v1/users', userData);
  }

  async updateUser(userId, updates) {
    return this.request('PUT', `/api/public/v1/users/${userId}`, updates);
  }

  async deleteUser(userId) {
    return this.request('DELETE', `/api/public/v1/users/${userId}`);
  }

  async getUsersByRole(role, filters = {}) {
    const params = new URLSearchParams();
    if (filters.taxCenter) params.append('taxCenter', filters.taxCenter);
    if (filters.auditType) params.append('auditType', filters.auditType);

    const queryString = params.toString();
    return this.request(
      'GET',
      `/api/public/v1/users/by-role/${role}${queryString ? '?' + queryString : ''}`
    );
  }

  async getUserPermissions(userId) {
    return this.request('GET', `/api/public/v1/users/${userId}/permissions`);
  }

  async getAuditAssignments(userId) {
    return this.request('GET', `/api/public/v1/users/${userId}/audit-assignment`);
  }

  async assignAuditCase(userId, caseId, allocate = true) {
    return this.request('POST', `/api/public/v1/users/${userId}/audit-assignment`, {
      caseId,
      allocate,
    });
  }

  // ============ ORGANIZATION ============
  async listRegions() {
    return this.request('GET', '/api/public/v1/org/regions');
  }

  async getTaxCentersInRegion(regionCode) {
    return this.request('GET', `/api/public/v1/org/regions/${regionCode}/tax-centers`);
  }

  async getUsersAtTaxCenter(taxCenterId, role = null) {
    const query = role ? `?role=${role}` : '';
    return this.request('GET', `/api/public/v1/org/tax-centers/${taxCenterId}/users${query}`);
  }

  async getTeamsAtTaxCenter(taxCenterId) {
    return this.request('GET', `/api/public/v1/org/tax-centers/${taxCenterId}/teams`);
  }

  async getTeamMembers(teamId) {
    return this.request('GET', `/api/public/v1/org/teams/${teamId}/members`);
  }

  // ============ PERMISSIONS ============
  async getRoleCatalog() {
    return this.request('GET', '/api/public/v1/roles');
  }

  async validatePermission(userId, permission) {
    const result = await this.request('POST', '/api/public/v1/validate-permission', {
      userId,
      permission,
    });
    return result.allowed;
  }
}

// Export singleton instance
export default new UserManagementClient();
