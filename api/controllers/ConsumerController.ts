import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from "ts-framework";
import Validate, { Params } from "ts-framework-validation";
import BitcapitalService from "../services/BitcapitalService" ;
import ErrorParser from "../services/ErrorParser";
import { User } from "../models";
import ValidatorHelper from "../services/ValidatorHelper";
import AuthHandler from "../services/AuthHandler";
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
      throw new HttpError(error.error, error.status);
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
    AuthHandler.auth
  ])
  public static async authenticate(req: BaseRequest, res: BaseResponse) {
    res.success(responses.HTTP_SUCCESS_DATA(req.body));
  }
  /**
   * POST /consumer/documents
   */
  @Post("/documents", [
    AuthHandler.verify,
    //TODO create image file validator
    // Validate.serialCompose({
    //   documents: ValidatorHelper.isNotEmpty
    // })
  ])
  public static async uploadDocs(req: BaseRequest, res: BaseResponse) {
    let { front, back } = (req as any).files;
    // console.log(front[0]); return res.success('ok');

    try {
      // console.log(req.user.credentials); return res.success('OK');
      let apiClient = await BitcapitalService.getBitcapitalByToken(req.user);
      let newDocument = await apiClient.consumers().createDocument(req.user.id, {
        consumerId: req.user.id,
        type: DocumentType.BRL_IDENTITY,
        front: front[0].originalname,
        back: back[0].originalname
      });

      let result = newDocument.isValid();
      
      if (result) {
        await apiClient.consumers().uploadDocumentPicture(newDocument.id, DocumentType.BRL_IDENTITY, 'front', front[0]);
        await apiClient.consumers().uploadDocumentPicture(newDocument.id, DocumentType.BRL_IDENTITY, 'back', back[0]);
        return res.success(responses.HTTP_SUCCESS);
      }

      throw new HttpError('Invalid Document', 400);
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /consumer/home
   * @description retrive logged in consumer data
   */
  @Get("/home", [
    AuthHandler.verify
  ])
  public static async me(req: BaseRequest, res: BaseResponse) {
    try {
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);   
      let me = await bitcapital.current();

      res.success(responses.HTTP_SUCCESS_DATA(me));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
    
  }
}