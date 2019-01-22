import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from "ts-framework";
import Validate, { Params } from "ts-framework-validation";
import BitcapitalService from "../services/BitcapitalService" ;
import ErrorParser from "../services/ErrorParser";
import { User } from "../models";
import ValidatorHelper from "../services/ValidatorHelper";
import HandleAuth from "../services/HandleAuth";
import * as responses from "../lib/responses";
import { DocumentSchema, DocumentType } from 'bitcapital-core-sdk';
import { isValid } from "cpf";

@Controller("/consumer")
export default class ConsumerController {
  /**
   * POST /consumer/signon
   * @description Sign on a new consumer
   */
  @Post("/signon", [
    Validate.serialCompose({
      firstName: ValidatorHelper.isValidName,
      lastName: ValidatorHelper.isValidName,
      email: Params.isValidEmail,
      password: ValidatorHelper.isValidPassword,
      taxId: ValidatorHelper.isValidCPF
    })
  ])
  static async signon(req: BaseRequest, res: BaseResponse) {
    try {
      let remoteUser = await BitcapitalService.createConsumers({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        taxId: req.body.taxId
      });

      await User.create({
        bitCapitalId: remoteUser.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        taxId: req.body.taxId
      }).save();

      res.success(responses.HTTP_SUCCESS);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
  /**
   * POST /consumer/login
   * @description Authenticate a consumer with email and password returning the access token
   */
  @Post("/login", [
    Validate.serialCompose({
      username: Params.isValidEmail,
      password: ValidatorHelper.isNotEmpty
    }),
    HandleAuth.auth
  ])
  public static async authenticate(req: BaseRequest, res: BaseResponse) {
    res.success(responses.HTTP_SUCCESS_DATA(req.body));
  }
  /**
   * POST /consumer/documents
   */
  @Post("/documents", [
    HandleAuth.verify,
    //TODO create image file validator
    // Validate.serialCompose({
    //   documents: ValidatorHelper.isNotEmpty
    // })
  ])
  public static async uploadDocs(req: BaseRequest, res: BaseResponse) {
    let files = (req as any).files;
    console.log(files);

    try {
      let apiClient = await BitcapitalService.getBitcapitalByToken(req.user);
      let newDocument = await apiClient.consumers().createDocument(req.user.userId, {
        consumerId: req.user.userId,
        type: DocumentType.BRL_IDENTITY,
        front: files[0].originalname,
        back: files[1].originalname
      });

      let result = newDocument.isValid();
      
      if (result) {
        return res.success(responses.HTTP_SUCCESS);
      }

      throw new HttpError('Invalid Document', 400);
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
}