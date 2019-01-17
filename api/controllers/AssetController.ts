import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import ValidatorHelper from '../services/ValidatorHelper';
import { Asset } from '../models/Asset'
/*code: string;
name?: string;
wallet?: Wallet; */

@Controller("/assets")
export default class AssetController {
  @Post("/", [
    Validate.serialCompose({
      code: ValidatorHelper.isValidName,
      name: ValidatorHelper.isValidName,
      wallet: Params.isValidId
    })
  ])
  public static async createAssert() {}

}