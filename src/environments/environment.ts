// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // SERVER_URL: `./`,

  // With Mock data only
  // SERVER_URL: `./assets/mock/`,

  // with Local server
  // SERVER_URL: `http://localhost:5555/api/`,

  // AWS
  SERVER_URL: `http://ec2-54-67-86-232.us-west-1.compute.amazonaws.com:5555/api/`,

  // AWS K8S load balancer
  // SERVER_URL: `http://a1012631c841d42c7bc96fc6d54e56d8-1273732806.us-west-2.elb.amazonaws.com:5555/api/`,

  production: false,
  useHash: true,
  hmr: false,
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
