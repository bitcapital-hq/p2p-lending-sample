import Bitcapital, { User, Session, StorageUtil, MemoryStorage, Document, ConsumerStatus, Asset } from 'bitcapital-core-sdk';
import { BaseError } from 'ts-framework-common';
import { Transaction, Payment } from '../models/schemas';

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

      let me = await apiClient.session().password({
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
        domain: process.env.BITCAPITAL_CLIENT_DOMAIN as any,
        consumer: {
          userId: null,
          status: ConsumerStatus.PENDING_DOCUMENTS as any,
          isValid: true as any,
          taxId: user.taxId
        }
      });
      console.log(remoteUser, 'CONSUMERCONSUMERCONSUMERCONSUMERCONSUMERCONSUMERCONSUMERCONSUMERCONSUMERCONSUMER')

      return remoteUser;
    } catch(e) {
      throw e;
    }
  }

  public static async createDocument(id: string, document: Document): Promise<Document> {
    try {
      let apiClient = await BitcapitalService.authenticateMediator();
      let list = await apiClient.consumers().createDocument(id, document);

      return list;
    } catch(e) {
      throw e;
    }
  }

  public static async listConsumers(pagination: number): Promise<User[]> {
    let limit = +process.env.PAGINATION_LIMIT;

    try {
      let apiClient = await BitcapitalService.authenticateMediator();

      const list = await apiClient.consumers().findAll({skip: pagination, limit})
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

  public static async deposit(transaction: Transaction) {
    try {
      let apiClient = await BitcapitalService.authenticateMediator();
      let transactionAsset = apiClient.assets().emit({
        id: transaction.id,
        amount: transaction.amount,
        destination: transaction.wallet
      });

      return transactionAsset;
    } catch(e) {
      throw e;
    }
  }

  public static async pay(payment: Payment) {
    let apiClient = await BitcapitalService.authenticateMediator();
    let paymentOrder =  await apiClient.payments().pay({
        source: payment.source,
        recipients: payment.recipients,
        asset: payment.asset
    });

    return paymentOrder;
  }

  public static async createAsset(asset: Asset): Promise<Asset>{
    try {
      let apiClient = await BitcapitalService.authenticateMediator();
      let saved = apiClient.assets().create(asset);

      return saved;
    } catch (e) {
      throw e;
    }
  }

  public static async test(data) {
    try {
      let apiClient = await BitcapitalService.authenticateMediator()
      let asset = apiClient.assets().emit(data);

      return asset;
    } catch(e) {     
      throw e;
    }
    // apiClient.oauth().secret(token, { entity: 'wallet', id: '123123' })
    try {
      // let users = apiClient.assets().findAll({})
      // return  users
    } catch(e) {
      throw e;
    }
  }
};

export default BitcapitalService;