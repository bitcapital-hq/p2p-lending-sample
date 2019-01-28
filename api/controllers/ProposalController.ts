import { Controller, BaseRequest, BaseResponse, Post, HttpError, Put, HttpCode } from "ts-framework";
import Validate from "ts-framework-validation";
import ValidatorHelper from "../services/ValidatorHelper";
import { Proposal, Payment, PaymentStatus } from "../models";
import ErrorParser from "../services/ErrorParser";
import * as responses from "../lib/responses";
import AuthHandler from "../services/AuthHandler";
import BalanceService from "../services/BalanceService";
import Helpers from "../lib/Helpers";

@Controller("/proposals")
export default class ProposalController {
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
      let lendable = await BalanceService.getLendableBalance(req.user);
      if (lendable < req.body.amount) {
        throw new HttpError('Insufitient funds to create proposal', HttpCode.Client.FORBIDDEN);
      }

      let proposal = await Proposal.create({
        owner: req.user.DBId,
        amount: +req.body.amout,
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
