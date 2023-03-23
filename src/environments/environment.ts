// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { DelonMockModule } from '@delon/mock';
import { Environment } from '@delon/theme';

import * as MOCKDATA from '../../_mock';

export const environment = {
  production: false,
  useHash: true, // # in the URL
  api: {
    //  AWS Prod
    // baseUrl: 'http://k8s-staging-zuulserv-b633474817-1541550255.us-west-1.elb.amazonaws.com/api/', 
    // baseUrl: 'https://prod.claytechsuite.com/api/', 
    baseUrl: 'https://staging.claytechsuite.com/api/', 
    
    // baseUrl: 'http://dualstack.k8s-prod-webclien-8aaf75f256-1586881181.us-west-1.elb.amazonaws.com./#/passport/login',
    // baseUrl: 'http://gateway.claytechsuite.com/api/',
    // customer's internal K8S
    // baseUrl: 'http://10.0.10.37:32262/api/',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  modules: [DelonMockModule.forRoot({ data: MOCKDATA })]
} as Environment;

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
