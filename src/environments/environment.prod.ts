import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true, // # in the URL
  api: {
    baseUrl: './api/',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  }
} as Environment;
