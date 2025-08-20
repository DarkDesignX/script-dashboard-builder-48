import { Script, Customer } from '@/types/script';

const API_BASE_URL = '/api';

class ApiService {
  private async fetchWithErrorHandling(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.fetchWithErrorHandling('/customers');
  }

  async createCustomer(customer: Omit<Customer, 'id'> & { id: string }): Promise<Customer> {
    return this.fetchWithErrorHandling('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  // Scripts
  async getScripts(): Promise<Script[]> {
    return this.fetchWithErrorHandling('/scripts');
  }

  async getScript(id: string): Promise<Script> {
    return this.fetchWithErrorHandling(`/scripts/${id}`);
  }

  async createScript(script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> {
    return this.fetchWithErrorHandling('/scripts', {
      method: 'POST',
      body: JSON.stringify(script),
    });
  }

  async updateScript(id: string, script: Omit<Script, 'id' | 'createdAt' | 'updatedAt'>): Promise<Script> {
    return this.fetchWithErrorHandling(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(script),
    });
  }

  async deleteScript(id: string): Promise<void> {
    return this.fetchWithErrorHandling(`/scripts/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.fetchWithErrorHandling('/health');
  }
}

export const apiService = new ApiService();