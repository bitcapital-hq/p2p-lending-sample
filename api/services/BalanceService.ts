import { Wallet } from "bitcapital-core-sdk";
import BitcapitalService from "./BitcapitalService";
import { Proposal, ProposalStatus }  from "../models";
import { SessionUser } from "../models/schemas";
import { User } from "../models";

export default class GetUserBalance {
  private static reducer(a: number, b: number) {
    return a + b;
  }

  private static async getMainBalance(wallets: Wallet[]): Promise<number> {

    try {
      const bitcapital = await BitcapitalService.authenticateMediator();
      const newWallets = await Promise.all(wallets.map(each => bitcapital.wallets().findOne(each.id)));

      return newWallets.map(wal => wal.balances
        .filter(bal => bal.asset_code === process.env.LOCAL_ASSET_CODE)
        .map(ass => ass.balance)
        .reduce(GetUserBalance.reducer, 0))
      .reduce(GetUserBalance.reducer, 0);
    } catch(e) {
      throw e;
    }
  }

  public static async getLendableBalance(user: SessionUser) {
    try {
      const bitcapital = await BitcapitalService.getBitcapitalByToken(user);
      const wallets = await bitcapital.consumers().findWalletsById(user.id);
      const mainBalance = await GetUserBalance.getMainBalance(wallets);
      const proposals = await Proposal.find({
        owner: user.DBId,
        status: ProposalStatus.OPEN
      } as any);

      const commitedBalance = proposals.map(p => p.amount).reduce(GetUserBalance.reducer, 0);

      return mainBalance - commitedBalance;
    } catch(e) {
      throw e;
    }
  }

  public static async getLendableBalanceById(id: string) {
    try {
      let user = await User.findById(id);

      let bitcapital = await BitcapitalService.authenticateMediator();
      let BCUser = await bitcapital.consumers().findOne(user.bitCapitalId);
      let mainBalance = await GetUserBalance.getMainBalance(BCUser.wallets);
      let proposals = await Proposal.find({
        owner: user.id,
        status: ProposalStatus.OPEN
      } as any);
      let commitedBalance = proposals.map(p => p.amount).reduce(GetUserBalance.reducer, 0);

      return mainBalance - commitedBalance;
    } catch(e) {
      throw e;
    }
  }

  public static async getLendedBalance(user: SessionUser) {
    try {
      let proposals = await Proposal.find({
        owner: user.DBId,
        status: ProposalStatus.PENDING
      } as any);
      
      return proposals.map(p => p.amount).reduce(GetUserBalance.reducer, 0);
    } catch(e) {
      throw e;
    }
  }
}