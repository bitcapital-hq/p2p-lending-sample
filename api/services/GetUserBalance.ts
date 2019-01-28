import BitcapitalService from "./BitcapitalService";
import { User } from "../models";

export default class GetUserBalance {
  private user: User;
  private totalBalance: Promise<number>;
  constructor(user: User) {
    this.user = user;
    this.totalBalance = new Promise((resolve, reject) => {
      return BitcapitalService.authenticateMediator()
        .then(bitcapital => bitcapital.consumers().findWalletsById(user.bitCapitalId))
        .then(wallets => wallets[0].balances.filter(b => b.asset_code === process.env.LOCAL_ASSET_CODE))
        .then(balances => resolve(+balances[0].balance))
        .catch(e => reject(e));
    });
  }

  public static async getLendedBalance() {}

  public static async getLendableBalance() {}

}