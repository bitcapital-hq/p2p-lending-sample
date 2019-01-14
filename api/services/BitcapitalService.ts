import Bitcapital, { User, Session, StorageUtil, MemoryStorage } from 'bitcapital-core-sdk';
import { BaseError } from "ts-framework-common";

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
      throw new BaseError(e);
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
        throw new BaseError('Request failed with status 403');
      }

      return user;
    } catch(e) {
      throw new BaseError(e);
    }
  }
};

export default BitcapitalService;