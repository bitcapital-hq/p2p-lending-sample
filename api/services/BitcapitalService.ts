import Bitcapital, { User, Session, StorageUtil, MemoryStorage } from 'bitcapital-core-sdk';
import { userInfo } from 'os';
import { HttpError, HttpCode } from 'ts-framework';

const credentials = {
  baseURL: process.env.BITCAPITAL_CLIENT_URL,
  clientId: process.env.BITCAPITAL_CLIENT_ID,
  clientSecret: process.env.BITCAPITAL_CLIENT_SECRET
};

const session: Session = new Session({
  storage: new StorageUtil('session', new MemoryStorage()),
  http: credentials,
  oauth: credentials
})

class BitcapitalService {
  public static bitcapital: Bitcapital;

  public static async initialize() {
    BitcapitalService.bitcapital = Bitcapital.initialize({
      session,
      ...credentials
    });

    try {
      await BitcapitalService.bitcapital.session().clientCredentials();
  
      return BitcapitalService.bitcapital;
    } catch(e) {
      throw new HttpError(e.message, HttpCode.Server.INTERNAL_SERVER_ERROR, {method: 'initialize', file: 'BitcapitalService.ts', line: '31'});
    }
  }

  public static async getAPIClient(): Promise<Bitcapital> {
    if (BitcapitalService.bitcapital) {
      return BitcapitalService.bitcapital;
    }

    return BitcapitalService.initialize()
  }

  public static async authenticate(username: string, password: string): Promise<User> {
    try {
      let client = await BitcapitalService.getAPIClient();
      let user = await client.session().password({
        username,
        password
      });

      if (user.role === 'mediator') {
        console.log('2222222222222222222222222222222222222222222222222222222')
        throw new HttpError('FORBIDDEN', HttpCode.Client.FORBIDDEN);
      }

      return user;
    } catch(e) {
      console.log(e.message, e.status, '33333333333333333333333333333333333333333333333333333333333')
      throw new HttpError(e.message, e.status || e.message.replace('Request failed with status code ', '') || HttpCode.Server.INTERNAL_SERVER_ERROR);
    }
  }
};

export default BitcapitalService;