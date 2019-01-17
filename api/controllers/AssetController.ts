import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService';
import Validate, { Params } from 'ts-framework-validation';
import ValidatorHelper from '../services/ValidatorHelper';
import { Asset } from '../models';
import ErrorParser from '../services/ErrorParser';
/*code: string;
name?: string;
wallet?: Wallet; */

@Controller("/assets")
export default class AssetController {
  /**
   * POST /
   * @description Create a new asset
   */
  @Post("/", [
    Validate.serialCompose({
      code: ValidatorHelper.isValidName,
      name: ValidatorHelper.isValidName,
      wallet: Params.isValidId
    })
  ])
  public static async createAsset(req: BaseRequest, res: BaseResponse) {
    try {
     let newAsset = BitcapitalService.createAsset(req.body);

     res.success(newAsset);
    } catch (e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }

}