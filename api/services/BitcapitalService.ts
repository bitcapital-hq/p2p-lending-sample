import Bitcapital, { User, Session, StorageUtil, MemoryStorage, Document } from 'bitcapital-core-sdk';
import { BaseError } from 'ts-framework-common';
import ErrorParser from './ErrorParser';
import { HttpError } from 'ts-framework';
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

const enum ConsumerStatus {
  PENDING_DOCUMENTS = "pending_documents",
  PENDING_SELFIE = "pending_selfie",
  PROCESSING = "processing",
  VERIFIED = "verified",
  SUSPENDED = "suspended",
  DELETED = "deleted",
  INVALID_DOCUMENTS = "invalid_documennts",
  INVALID_SELFIE = "invalid_selfie",
  MANUAL_VERIFICATION = "manual_verification"
}

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
          userId: null,
          status: ConsumerStatus.PENDING_DOCUMENTS as any,
          isValid: true as any,
          taxId: user.taxId
        }
      });

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
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
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

  public static async test(token: string) {
    let apiClient = await BitcapitalService.authenticateMediator()
    // apiClient.oauth().secret(token, { entity: 'wallet', id: '123123' })
    try {
      let users = apiClient.assets().findAll({})
      return  users
    } catch(e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }


};

export default BitcapitalService;