import { Controller, BaseRequest, BaseResponse, Post, HttpError, Put, HttpCode, Get } from "ts-framework";
import { LessThan, MoreThan, Between } from "typeorm";
import Validate from "ts-framework-validation";
import ValidatorHelper from "../services/ValidatorHelper";
import { Proposal, User, ProposalStatus } from "../models";
import ErrorParser from "../services/ErrorParser";
import * as responses from "../lib/responses";
import AuthHandler from "../services/AuthHandler";
import Helpers from "../lib/Helpers";
import { Payment, Recipient } from "bitcapital-core-sdk";
import BitcapitalService from "../services/BitcapitalService";

@Controller("/proposals")
export default class ProposalController {
  /**
   * 
   */
  private static async queryParser(query: any): Promise<any> {
    const validProps = [
      'maxAmount', 'minAmount', 'maxInterest', 'minInterest', 'maxInstallments', 'minInstallmens', 'amount', 'interest'
    ];
    const props = {
      amount: 'amount',
      maxAmount: 'amount',
      minAmount: 'amount',
      maxInterest: 'monthlyInterest',
      minInterest: 'monthlyInterest',
      maxInstallments: 'maxInstallments',
      minInstallmens: 'minInstallmens',
      interest: 'interest'
    };
    const method = {
      amount: (a:number)  => a,
      maxAmount: LessThan,
      minAmount: MoreThan,
      maxInterest: LessThan,
      minInterest: MoreThan,
      interest: (i: number) => i
    };
    let where = [];

    if (query.minAmount && query.maxAmount) {
      where.push({ amount: Between(query.minAmount, query.maxAmount) });
      delete query.minAmount;
      delete query.maxAmount;
    }

    if (query.minInterest && query.maxInterest) {
      where.push({ interest: Between(query.minInterest, query.maxInterest) });
      delete query.minInterest;
      delete query.maxInterest;
    }

    for (let prop in query) {
      if (validProps.includes(prop) && !isNaN(+query[prop])) {
        where.push({[props[prop]]: method[prop](query[prop])});
      }
    }

    where.push({ status: 'open' });

    return where;
  }
  /**
   * POST /proposals
   * @description Create a new Proposal
   */
  @Post("/", [
    AuthHandler.verify,
    Validate.serialCompose({
      amount: ValidatorHelper.isValidMoney,
      monthlyInterest: ValidatorHelper.isValidMoney,
      minInstalments: ValidatorHelper.isValidInt,
      maxInstalments: ValidatorHelper.isValidInt
    })
  ])
  public static async createProposal(req: BaseRequest, res: BaseResponse) {
    try {
      let user = await User.findById(req.user.DBId);  
      let proposal = await Proposal.create({
        owner: user,
        amount: +req.body.amount,
        monthlyInterest: +req.body.monthlyInterest,
        minInstalments: +req.body.minInstalments,
        maxInstalments: +req.body.maxInstalments
      }).save();

      res.success(responses.HTTP_SUCCESS_DATA(proposal));
    } catch (e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /proposals/search?query
   * @description search for proposals
   */
  @Get("/search")
  public static async searchProposals(req: BaseRequest, res: BaseResponse) {
    try {
      let result = await Proposal.find({
        where: await ProposalController.queryParser(req.query)
      });
      res.success(responses.HTTP_SUCCESS_DATA(result))
    } catch (e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * PUT /proposals/:id
   * @description Update the proposal
   */
  @Put("/:id", [
    AuthHandler.verify,
    Validate.serialCompose({
      borrower: ValidatorHelper.isNotEmpty,
      finalInstalments: ValidatorHelper.isValidInt
    })
  ])
  public static async updateProposal(req: BaseRequest, res: BaseResponse) {
    try {
      let proposal = await Proposal.findOne(req.params.id);

      proposal.borrower = await User.findById(req.user.DBId);
      proposal.finalInstalments = req.body.finalInstalments;

      proposal.finalAmount = proposal.amount + Helpers.totalInterest(proposal.monthlyInterest, proposal.amount, proposal.finalInstalments);
      proposal.status = ProposalStatus.PENDING;

      let updatedeProposal = await proposal.save();
      let bitcapital = await BitcapitalService.authenticateMediator();
      let source = await bitcapital.users().findOne(proposal.owner.bitCapitalId);

      await bitcapital.payments().pay({
        source: source.wallets[0].id,
        recipients: [{
          destination: req.user.wallets[0].id,
          amount: proposal.amount as any
        }]
      });


      res.success(responses.HTTP_SUCCESS_DATA(updatedeProposal));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}
