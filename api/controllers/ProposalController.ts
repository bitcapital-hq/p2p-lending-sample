import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError, Put } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService';
import Validate, { Params } from 'ts-framework-validation';
import ValidatorHelper from '../services/ValidatorHelper';
import { Proposal } from '../models';
import ErrorParser from '../services/ErrorParser';
import * as responses from '../lib/responses';
import AuthHandler from '../services/AuthHandler';

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
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      
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


    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}
