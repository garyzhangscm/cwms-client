// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import * as MOCKDATA from '@_mock'; 
import { Environment } from '@delon/theme';

export const environment = {
  production: false,
  useHash: true,
  api: {
    // baseUrl: './',    
    //  AWS Prod
    // baseUrl: 'http://k8s-staging-webclien-d59c548886-1645723175.us-west-1.elb.amazonaws.com/api/', 
    // baseUrl: 'https://prod.claytechsuite.com/api/', 
    baseUrl: 'https://staging.claytechsuite.com/api/', 
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  // providers: [provideMockConfig({ data: MOCKDATA })],
  // interceptorFns: [mockInterceptor]
} as Environment;
