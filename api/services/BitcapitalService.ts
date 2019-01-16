import Bitcapital, { User, Session, StorageUtil, MemoryStorage, PaginatedArray } from 'bitcapital-core-sdk';
import { BaseError } from 'ts-framework-common';


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
      throw e;
    }
  }

  public static async getAPIClient(): Promise<Bitcapital> {
    if (BitcapitalService.bitcapital) {
      return await BitcapitalService.bitcapital;
    }

    return await BitcapitalService.initialize()
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
      throw e;
    }
  }

  public static async authenticateMediator(): Promise<Bitcapital> {
    try {
      let apiClient = await BitcapitalService.getAPIClient();

      await apiClient.session().password({
        username: process.env.BITCAPITAL_MEDIATOR_EMAIL,
        password: process.env.BITCAPITAL_MEDIATOR_PASSWORD
      });

      return apiClient;
    } catch(e) {
      throw e;
    }
  }

  public static async createConsumers(user: any): Promise<User> {
    try {
      let apiClient = await BitcapitalService.authenticateMediator();
      let remoteUser = await apiClient.consumers().create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        consumer: {
          taxId: user.taxId
        } as any
      });

      return remoteUser;
    } catch(e) {
      throw e;
    }
  }

  public static async listConsumers(pagination: number): Promise<User[]> {
    let limit = +process.env.PAGINATION_LIMIT;

    try {
      let apiClient = await BitcapitalService.getAPIClient();
      await apiClient.session().password({
        username: process.env.BITCAPITAL_MEDIATOR_EMAIL,
        password: process.env.BITCAPITAL_MEDIATOR_PASSWORD
      });

      const list = await apiClient.consumers().findAll({skip: pagination, limit: +process.env.PAGINATION_LIMIT})
      return list;
    } catch(e) {
      throw e;
    }
  }

  public static async getConsumer(id: string): Promise<User> {
    try {
      let apiClient = await BitcapitalService.authenticateMediator();
      await apiClient.session().password({
        username: process.env.BITCAPITAL_MEDIATOR_EMAIL,
        password: process.env.BITCAPITAL_MEDIATOR_PASSWORD
      });

      let consumer = await apiClient.consumers().findOne(id);

      return consumer;
    } catch(e) {
      throw e;
    }
  }

  public static async test(token: string) {
    let apiClient = await BitcapitalService.getAPIClient()
    // apiClient.oauth().secret(token, { entity: 'wallet', id: '123123' })
    let users = apiClient.users()
    return  users
  }
};

export default BitcapitalService;