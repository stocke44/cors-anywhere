// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');
cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
    // Other Heroku added debug headers
    // 'x-forwarded-for',
    // 'x-forwarded-proto',
    // 'x-forwarded-port',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    Authorization:'Bearer eyJ0eXAiOiJhdCtKV1QiLCJhbGciOiJSUzUxMiJ9.eyJzdWIiOiI4YWEwNDhlZDM1YTgxMDJhNDgwOGMxMzcwZjY2MDAwMCIsImF1ZCI6Imh0dHBzOi8vd2QyLWltcGwtc2VydmljZXMxLndvcmtkYXkuY29tL2NjeC8iLCJzY29wZSI6Im9hdXRoIiwiaXNzIjoiaHR0cHM6Ly93ZDItaW1wbC1zZXJ2aWNlczEud29ya2RheS5jb20vY2N4L2FwaS92MS9zb2N1cmUiLCJleHAiOjE2NzcyMzgzOTYsImlhdCI6MTY3NzIyMzk5NiwianRpIjoiY0RJeE1UZHdPR3hoYUdZMFltcHpaWGc0YVdKeVptSnFlbTlqTUdzNWVUY3phRFZ5YTJ0amN6ZDFOSGcyY0cxNllXOXpaRFZrYkhoeWVuZDVhWGxwT0docGRHbDNaakUyYTI5amNXUTFNM1F5T1hGdllXSTFhWEp1YzNReGNteGhiM0F4TGpKaE5URmlPRFpqTFRJek9UY3RORGcwWkMwNVptTXlMVE00T1dZNE5XUTNOR05rTWc9PSIsImNsaWVudF9pZCI6Ik1ESTJPR1JoWm1JdE9XRmxaQzAwWldSbUxXSTFOVFF0T1dabU1tWTBNalF6TmprdyJ9.OUlCz9kWaMqWIA11_gNjeD9VQgD9OPFJSuq7k52Rohe_iJ6UfKTATgu7MBvq8a3PwhrZWgiUE5DHo6JZrtIPc1ocRXnE24MlC0O1ngbs_ib3DNFV8-XliDL4WO6vgIU0FY7BiJlQeD8KrHmGXThcIReyroUceTJuq9DfNP7je6sP-foZMGhuQBv_Ly2PCumyeOVUdS_AKnZZRv92prjX5SZkNqBNXEg3TTpY-5jCVq4M2odoV3FAbO6ZOA78HAZhyMqSaRXgUzcizKYbye0g7R9euZZR_l8uFSXW05dvjP2bZjei5Tc67JWFu345ZRnOuTuOzYnMBGoJj0eLN9VpGQ',
    xfwd: false,
  },
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
