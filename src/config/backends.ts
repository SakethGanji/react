/**
 * Environment Configuration
 *
 * Determines backend URLs based on the current hostname.
 * Each environment can have multiple backends.
 */

interface Backends {
  dashboard: string;
  settings: string;
  guardrails: string;
  // Add more backends as needed:
  // auth: string;
  // analytics: string;
}

// Add your environments here
const ENVIRONMENTS: Record<string, Backends> = {
  'localhost': {
    dashboard: 'http://localhost:8000',
    settings: 'http://localhost:8000',   // Change port when running separate service
    guardrails: 'http://localhost:8000', // Change port when running separate service
  },
  '127.0.0.1': {
    dashboard: 'http://localhost:8000',
    settings: 'http://localhost:8000',
    guardrails: 'http://localhost:8000',
  },

  // Development
  // 'dev.yourapp.com': {
  //   dashboard: 'https://dashboard-dev.yourapp.com',
  //   settings: 'https://settings-dev.yourapp.com',
  //   guardrails: 'https://guardrails-dev.yourapp.com',
  // },

  // Production
  // 'app.yourapp.com': {
  //   dashboard: 'https://dashboard.yourapp.com',
  //   settings: 'https://settings.yourapp.com',
  //   guardrails: 'https://guardrails.yourapp.com',
  // },
};

// Default: same origin for all backends
const DEFAULT_BACKENDS: Backends = {
  dashboard: '',
  settings: '',
  guardrails: '',
};

function getBackends(): Backends {
  const hostname = window.location.hostname;
  return ENVIRONMENTS[hostname] ?? DEFAULT_BACKENDS;
}

export const backends = getBackends();
