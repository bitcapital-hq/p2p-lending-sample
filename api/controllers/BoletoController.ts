import { Controller, BaseRequest, BaseResponse, Post, HttpError, Put, HttpCode, Get } from "ts-framework";
import Validate from "ts-framework-validation";
import AuthHandler from "../services/AuthHandler";
import ValidatorHelper from "../services/ValidatorHelper";
import { Boleto } from "../models";
import ErrorParser from "../services/ErrorParser";
import * as responses from "../lib/responses";
import BitcapitalService from "../services/BitcapitalService";
import { BoletoStatus } from "../models/Boleto";


@Controller("/boletos")
export default class BoletoController {
  /**
   * POST /boletos
   * create a new boleto for a given wallet
   */
  @Post("/", [
    AuthHandler.verify,
    Validate.serialCompose({
      walletId: ValidatorHelper.isNotEmpty,
      amount: ValidatorHelper.isValidMoney
    })
  ])
  public static async createBoleto(req: BaseRequest, res: BaseResponse) {
    try {
      let boleto = await Boleto.createBoleto(req.body.walletId, req.body.amount);

      res.success(responses.HTTP_SUCCESS_DATA(boleto));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * POST /boletos/me
   * create a ne boleto the logged user
   */
  @Post("/me", [
    AuthHandler.verify,
    Validate.serialCompose({
      amount: ValidatorHelper.isValidMoney
    })
  ])
  public static async  depositForMe(req: BaseRequest, res: BaseResponse) {
    try {
      let boleto = await Boleto.createBoleto(req.user.walletId, req.body.amount);

      res.success(responses.HTTP_SUCCESS_DATA(boleto));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /boletos
   * @description return consumer boletos
   */
  @Get("/", [
    AuthHandler.verify
  ])
  public static async listBoletos(req: BaseRequest, res: BaseResponse) {
    try {
      let boletos = await Boleto.find({ where: { walletId: req.user.walletId } });

      res.success(responses.HTTP_SUCCESS_DATA(boletos));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * PUT /boletos/pay
   * @description post back for paid boletos
   */
  @Put("/pay/:id", [
    AuthHandler.verifyPostBack
  ])
  public static async payBoleto(req: BaseRequest, res: BaseResponse) {
    try {
      let boleto = await Boleto.findById(req.params.id);

      if (boleto.status === BoletoStatus.EXPIRED || boleto.status === BoletoStatus.PAID) {
        throw new HttpError('Boleto alread paid or expired.', HttpCode.Server.SERVICE_UNAVAILABLE);
      }

      if (!boleto) {
        throw new HttpError('Boleto not found!', HttpCode.Server.SERVICE_UNAVAILABLE);
      }

      let transaction = await BitcapitalService.deposit({
        id: process.env.LOCAL_ASSET_ID,
        amount: boleto.amount.toString(),
        wallet: boleto.walletId 
      } as any);
      let paid = await Boleto.payBoleto(req.params.id);
      let isValid = await transaction.isValid();

      if (isValid && paid) {
        return res.success(responses.HTTP_SUCCESS_DATA(transaction));
      }

      throw new HttpError('INVALID TRANSACTION CAUGHT', HttpCode.Server.INTERNAL_SERVER_ERROR);
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}