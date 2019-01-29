import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from "ts-framework";
import BitcapitalService from "../services/BitcapitalService";
import Validate from "ts-framework-validation";
import ValidatorHelper from "../services/ValidatorHelper";
import { Asset } from "../models";
import ErrorParser from "../services/ErrorParser";
import * as responses from "../lib/responses";

@Controller("/assets")
export default class AssetController {
  /**
   * POST /assets
   * @description Create a new asset
   */
  @Post("/", [
    Validate.serialCompose({
      code: ValidatorHelper.isValidName,
      name: ValidatorHelper.isValidName,
      wallet: ValidatorHelper.isNotEmpty
    })
  ])
  public static async createAsset(req: BaseRequest, res: BaseResponse) {
    try {
     let newAsset = await BitcapitalService.createAsset(req.body);
     let dbAsset = await Asset.create({
       code: newAsset.code,
       name: newAsset.name,
       wallet: newAsset.wallet as any
     }).save();

     res.success(dbAsset);
    } catch (e) {
 
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * POST /assets/emit
   * @description emit asset to a wallet
   */
  @Post("/emit", [
    Validate.serialCompose({
      id: ValidatorHelper.isNotEmpty,
      amount: ValidatorHelper.isValidMoney,
      destination: ValidatorHelper.isNotEmpty
    })
  ])
  public static async emitAsset(req: BaseRequest, res: BaseResponse) {
    try {
      let newTransaction = await BitcapitalService.emitAsset(req.body);

      res.success(responses.HTTP_SUCCESS_DATA(newTransaction));
    } catch (e) {
 
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /assets
   * @description list assets in the plataform
   */
  @Get("/")
  public static async listAssets(req: BaseRequest, res: BaseResponse)  {
    try {
      let bitcapital = await BitcapitalService.authenticateMediator();
      let assets = await bitcapital.assets().findAll({});

      res.success(responses.HTTP_SUCCESS_DATA(assets));
    } catch (e) {
 
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}