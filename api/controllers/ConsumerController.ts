import { DocumentType } from 'bitcapital-core-sdk';
import { Controller, Get, BaseRequest, BaseResponse, Post, Put, HttpError } from "ts-framework";
import Validate, { Params } from "ts-framework-validation";
import BitcapitalService from "../services/BitcapitalService" ;
import ErrorParser from "../services/ErrorParser";
import { User, Proposal, ProposalStatus } from "../models";
import ValidatorHelper from "../services/ValidatorHelper";
import AuthHandler from "../services/AuthHandler";
import * as responses from "../lib/responses";

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
        walletId: remoteUser.wallets[0].id,
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
    AuthHandler.verify
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
      //do not use req.user to  ensure the assets will be updated
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      let me = await bitcapital.current();

      res.success(responses.HTTP_SUCCESS_DATA(me));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /consumer/status
   * @description retrive logged in consumer data
   */
  @Get("/home/status", [
    AuthHandler.verify
  ])
  public static async status(req: BaseRequest, res: BaseResponse) {
    try {
      //do not use req.user to  ensure the assets will be updated
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      let me = await bitcapital.current();

      res.success(responses.HTTP_SUCCESS_DATA(me.status));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  @Get("/home/assets", [
    AuthHandler.verify
  ])
  public static async assets(req: BaseRequest, res: BaseResponse) {
    try {
      //do not use req.user to  ensure the assets will be updated
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      let me = await bitcapital.current();

      res.success(responses.HTTP_SUCCESS_DATA(me.wallets));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * PUT /consumer/complete
   * @description Complete user registration
   */
  @Put("/complete", [
    AuthHandler.verify,
    Validate.serialCompose({
      phoneNumber: Params.isValidPhoneNumber,
      phoneCountryCode: ValidatorHelper.isValidCountryCode,
      phoneLocalCode: ValidatorHelper.isValidLocalCode,
      address: Params.isValidName, 
      addressNumber: Params.isValidName,
      // complement: Params.isValidEmail,
      postcode: ValidatorHelper.isValid,
      addressReference: ValidatorHelper.isValid,
      bankCode: ValidatorHelper.isValid,
      branch: ValidatorHelper.isValid,
      account: ValidatorHelper.isValid,
    })
  ])
  public static async update(req: BaseRequest, res: BaseResponse) {
    try {
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      await bitcapital.consumers().update(req.user.id, req.body);
      let user = await User.update({bitCapitalId: req.user.id}, req.body);

      res.success(responses.HTTP_SUCCESS_DATA(user));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /consumer/balance
   * @description Geth consumer account balance
   */
  @Get("/balance", [
    AuthHandler.verify
  ])
  public static async getBalance(req: BaseRequest, res: BaseResponse) {
    try {
      let bitcapital = await BitcapitalService.getBitcapitalByToken(req.user);
      let wallet = await bitcapital.wallets().findOne(req.user.wallets[0].id);
      let baseBalance = wallet.balances.filter(b => b.asset_code === process.env.LOCAL_ASSET_CODE);
      let balance = baseBalance.length ? baseBalance : {
        "balance": "0.0000000",
        "limit": "922337203685.4775807",
        "buying_liabilities": "0.0000000",
        "selling_liabilities": "0.0000000",
        "asset_type": "credit_alphanum4",
        "asset_code": "BRHD",
        "asset_issuer": "GB77IHDH2Z2DCYZ42CTW4VPGS2XN7MW6EUHXF4JGPRE2FQQJMPNZP253"
      };

      res.success(responses.HTTP_SUCCESS_DATA(balance));
    }  catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /consumer/blockchainStatement
   * @description Get consumer blockchain statement
   */
  @Get("/blockchainStatement/:skip", [
    AuthHandler.verify
  ])
  public static async blockchain(req: BaseRequest, res: BaseResponse) {
    try {

      let bitcapital = await BitcapitalService.authenticateMediator();
      let statement = await bitcapital.wallets()
        .findWalletTransactions(req.user.wallets[0].id, {limit: +process.env.PAGINATION_LIMIT, skip: +req.params.skip});
      
      res.success(responses.HTTP_SUCCESS_DATA(statement));
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /consumer/lendingStatement
   * @description Get consumer lending statement
   */
  @Get("/lendingStatement/:skip", [
    AuthHandler.verify
  ])
  public static async lending(req: BaseRequest, res: BaseResponse) {
    try {
      let lendings = Proposal.find({owner: req.user.BDId, status: ProposalStatus.PENDING});

      
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}//https://github.com/bitcapital-hq/bitcapital-core/blob/master/api/jobs/RootDomainJob.ts