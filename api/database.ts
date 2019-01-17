import { EntityDatabase } from 'ts-framework-sql';
import Config from '../config';
import { Asset, User, Proposal, Payment } from "./models";

export default class MainDatabase extends EntityDatabase {
  protected static ENTITIES = [User, Proposal, Payment, Asset]

  protected static instance: MainDatabase = new MainDatabase();

  protected constructor() {
    super({
      connectionOpts: {
        ...Config.database,
        entities: Object.values(MainDatabase.ENTITIES),
      },
    } as any)
  }

  public static getInstance() {
    return this.instance;
  }
}
