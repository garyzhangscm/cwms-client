import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  api: {
    // baseUrl: './',    
    // baseUrl: 'https://prod.claytechsuite.com/api/', 
    baseUrl: './api/', 
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  }
} as Environment;
