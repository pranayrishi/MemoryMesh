const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Patient endpoints
  async getPatient() {
    return this.request('/patient');
  }

  async updatePatient(data) {
    return this.request('/patient/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analysis endpoints
  async analyzeImage(imageUrl) {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ imageUrl }),
    });
  }

  // Statistics endpoints
  async getStatistics() {
    return this.request('/statistics');
  }

  async getDailySummary() {
    return this.request('/summary/daily');
  }

  async getInterventionHistory(limit = 20) {
    return this.request(`/history/interventions?limit=${limit}`);
  }

  async getTimeline() {
    return this.request('/timeline');
  }

  // Demo scenarios
  async triggerScenario(scenarioType, context = {}) {
    return this.request(`/demo/scenario/${scenarioType}`, {
      method: 'POST',
      body: JSON.stringify(context),
    });
  }

  // Voice service
  async speak(message, options = {}) {
    return this.request('/voice/speak', {
      method: 'POST',
      body: JSON.stringify({ message, options }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
