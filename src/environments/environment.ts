// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // applicationName: "METRIC",
  // imagePath: "https://metric.jambars.orange-sonatel.com/assets/img/",
  // metricPath: "https://metric.jambars.orange-sonatel.com/",
  // serverURLjambarlocale:"http://localhost:3001/api/",
  // serverURLMETRIClocal : "http://127.0.0.1:3009/",
  applicationName: "METRIC",
  imagePath: "http://localhost:3001/images/",
  metricPath: "http://localhost:3001/metric/",
  serverURLMETRIC: "http://localhost:3001/api/v1/",
  serverURLjambar: "https://api.gaalgui.sn/",
  serverURLjambarlocale: "http://localhost:3001/api/v1/",
  serverURLMETRIClocal: "http://localhost:3001/api/v1/",
  //apiUrl: "http://localhost:3001/api/v1"
  apiUrl: "https://api.gaalgui.sn",
 
};
