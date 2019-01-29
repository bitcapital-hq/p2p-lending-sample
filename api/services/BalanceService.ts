import { Wallet } from "bitcapital-core-sdk";
import BitcapitalService from "./BitcapitalService";
import { Proposal, ProposalStatus }  from "../models";
import { SessionUser } from "../models/schemas";
import { User } from "../models";

export default class GetUserBalance {
  private static async getMainBalance(wallets: Wallet[]): Promise<number> {
    try {
      function reducer(a: number, b: number) {
        return a + b;
      }
      const bitcapital = await BitcapitalService.authenticateMediator();
      const newWallets = await Promise.all(wallets.map(each => bitcapital.wallets().findOne(each.id)));

      return newWallets.map(w => w.balances
        .filter(b => b.asset_code === process.env.LOCAL_ASSET_CODE)
        .map(a => a.balance)
        .reduce(reducer))
      .reduce(reducer);
    } catch(e) {
      throw e;
    }
  }

  public static async getLendableBalance(user: SessionUser) {
    try {
      let bitcapital = await BitcapitalService.getBitcapitalByToken(user);
      let wallets = await bitcapital.consumers().findWalletsById(user.id);
      let mainBalance = await GetUserBalance.getMainBalance(wallets);
      let proposals = await Proposal.find({
        owner: user.DBId,
        status: ProposalStatus.OPEN
      } as any);
      let commitedBalance = proposals.map(p => p.amount).reduce((a, b) => a + b);

      return mainBalance - commitedBalance;
    } catch(e) {
      throw e;
    }
  }

  public static async getLendableBalanceById(id: string) {
    try {
      let user = await User.findById(id);
      if (!user) {
        console.log(id, user)
        process.exit(1);
      }

      let bitcapital = await BitcapitalService.authenticateMediator();
      let BCUser = await bitcapital.consumers().findOne(user.bitCapitalId);
      console.log(BCUser);
      let mainBalance = await GetUserBalance.getMainBalance(BCUser.wallets);
      let proposals = await Proposal.find({
        owner: id,
        status: ProposalStatus.OPEN
      } as any);
      let commitedBalance = proposals.map(p => p.amount).reduce((a, b) => a + b);

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
      
      return proposals.map(p => p.amount).reduce((a, b) => a + b);
    } catch(e) {
      throw e;
    }
  }
}