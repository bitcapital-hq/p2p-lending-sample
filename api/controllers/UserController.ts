import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import BitcapitalService from '../services/BitcapitalService' ;
import ErrorParser from '../services/ErrorParser';
import { User } from '../models';
import ValidatorHelper from '../services/ValidatorHelper';
import HandleAuth from '../services/HandleAuth';

@Controller("/users")
export default class UserController {
  @Post('/test', [
    HandleAuth.verify
  ])
  static async test(req: BaseRequest, res: BaseResponse) {
    try {
      let bitcapital =  await BitcapitalService.getBitcapitalByToken(req.user);
      let test = bitcapital.session().oauthWebService;

      res.success(test);
    } catch(e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /users/me
   * @description get user by token
   */
  @Get("/me", [
    HandleAuth.verify
  ])
  static async me(req: BaseRequest, res: BaseResponse) {
    try {
      let consumer = req.user;
      return res.success(consumer);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /users/:pagination
   * @description List users as consumers
   */
  @Get("/:pagination")
  static async getUsers(req: BaseRequest, res: BaseResponse) {
    try {
      let consumers = await BitcapitalService.listConsumers(req.params.pagination || 0);
      return res.success(consumers);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * GET /users/:id
   * @description get user by id
   */
  @Get("/:id")
  static async getUser(req: BaseRequest, res: BaseResponse) {
    try {
      let consumer = await BitcapitalService.getConsumer(req.params.id);
      return res.success(consumer);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.error, error.status);
    }
  }
  /**
   * POST /users/authenticate
   * @description Authenticate a consumer with email and password returning the user
   */
  @Post("/authenticate", [
    Validate.serialCompose({
      username: Params.isValidEmail,
      password: ValidatorHelper.isNotEmpty
    }),
    HandleAuth.auth
  ])
  static async authenticate(req: BaseRequest, res: BaseResponse) {
    res.success(req.body);
  }
  /**
   * POST /users
   * @description Create a new consumer
   */
  @Post("/", [
    Validate.serialCompose({
      firstName: ValidatorHelper.isValidName,
      lastName: ValidatorHelper.isValidName,
      email: Params.isValidEmail,
      password: ValidatorHelper.isValidPassword,
      taxId: ValidatorHelper.isValidCPF
    })
  ])
  static async createUser(req: BaseRequest, res: BaseResponse) {
    try {
      let remoteUser = await BitcapitalService.createConsumers({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        taxId: req.body.taxId
      });
  
      let dbUser = await User.create({
        bitCapitalId: remoteUser.id,
        firstName: remoteUser.firstName,
        lastName: remoteUser.lastName,
        email: remoteUser.email,
        taxId: req.body.taxId
      }).save();
      
      return res.success(dbUser);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.error, error.status);
    }
  }
};
