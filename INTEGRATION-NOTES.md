https://bitcapital-hq.github.io/bitcapital-core-sdk/
import Bitcapital from 'bitcapital-core-sdk';

// Initialize the session instance to authenticate
// using the Bitcapital Core OAuth 2.0 provider.
const bitcapital = Bitcapital.initialize({
  // Instance URL for REST API calls
  baseURL: 'https://your-instance.btcore.app',
  // Credentials for OAuth 2.0 requests
  clientId: '< YOUR CLIENT_ID HERE >',
  clientSecret: '< YOUR CLIENT_SECRET HERE >',
});

try {
  // Authenticate a user with email and password from Bitcapital Core
  // If succeeds and available, the credentials will be stored in the 
  // session instance and in the local storage (for browser environments).
  const user = await bitcapital.session().password({
    email: 'user@example.com',
    password: '12345678',
  });
  this documentation refferes only to front end integration, on Node.js you must have a session and an storage

In ts-framework-validation documentation of version 2 refrers to Validation.compose but could only find serialCompose and parallelCompose

Sometimes the watch keep using an wrong version of transpiled code insisting on erros related to code no longer on a file. Fix using ts-framework clean

SDK Bitcapital.consumers().findAll() returns 403 FORBIDDEN

the method Bitcaptal.assets().create() creates assets accessible to diferent domains

I could not find any documentation on using authentication with the bearer token

Memory storage needs a memory DB suort, developing using SDK auth can be exausting due to mandatory re-login every time the app reloads due to file change

The SDK method bitcapital.wallets().findWalletTransactions(<walletId>, <pagination>) return the follwoing error when authenticated as cosumer
{
    "status": 403,
    "message": "[403] [403] Forbidden (stackId: 0af5a2ab-ccd9-493d-8fe8-f26d01995b79) (stackId: 9643ac05-cb72-4005-895f-23d406ec1cd6)",
    "stackId": "9643ac05-cb72-4005-895f-23d406ec1cd6",
    "details": {},
    "stack": "HttpError: [403] [403] Forbidden (stackId: 0af5a2ab-ccd9-493d-8fe8-f26d01995b79) (stackId: 9643ac05-cb72-4005-895f-23d406ec1cd6)\n    at Function.<anonymous> (/home/desoares/Projects/p2p-lending/api/controllers/ConsumerController.ts:207:23)\n    at Generator.throw (<anonymous>)\n    at rejected (/home/desoares/Projects/p2p-lending/api/controllers/ConsumerController.ts:14:65)"
}