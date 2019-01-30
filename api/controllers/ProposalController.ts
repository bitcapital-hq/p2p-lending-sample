import { Controller, BaseRequest, BaseResponse, Post, HttpError, Put, HttpCode, Get } from "ts-framework";
import { LessThan, MoreThan } from "typeorm";
import Validate from "ts-framework-validation";
import ValidatorHelper from "../services/ValidatorHelper";
import { Proposal, User } from "../models";
import ErrorParser from "../services/ErrorParser";
import * as responses from "../lib/responses";
import AuthHandler from "../services/AuthHandler";
import Helpers from "../lib/Helpers";

@Controller("/proposals")
export default class ProposalController {
  /**
   * 
   */
  private static async queryParser(query: object): Promise<object> {
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
      //maxInstallments: ,
     // minInstallmens: '',
      interest: (i: number) => i
    };
    let where = [];

    for (let prop in query) {
      if (validProps.includes(prop) && !isNaN(+query[prop])) {
        where.push({[props[prop]]: method[prop](query[prop])});
      }
    }
console.log(where, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
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
      proposal.borrower = req.body.borrower;
      proposal.finalInstalments = req.body.finalInstalments;

      let totalInterst = Helpers.totalInterest(proposal.monthlyInterest, proposal.amount, proposal.finalInstalments);
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}
