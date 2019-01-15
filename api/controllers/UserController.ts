import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import Validate, { Params } from 'ts-framework-validation';
import BitcapitalService from '../services/BitcapitalService' ;
import ErrorParser from '../services/ErrorParser';
import { User } from '../models';
import ValidatorHelper from '../services/ValidatorHelper';

@Controller("/users")
export default class UserController {
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
      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
  /**
   * POST /users/authenticate
   * @description Authenticate a consumer with email and password returning the user
   */
  @Post("/authenticate", [
    Validate.serialCompose({
      username: Params.isValidEmail
    })
  ])
  static async authenticate(req: BaseRequest, res: BaseResponse) {
    try {
      let authenticatedUser = await BitcapitalService.authenticate(req.body.username, req.body.password);
      res.success(authenticatedUser);
    } catch(e) {
      let status = e.message.includes('with status')
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
    }
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
      let bitcapital = await BitcapitalService.initialize();
      //let mediator = await BitcapitalService.authenticateMediator();

      let dbUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        taxId: req.body.taxId
      }).save();
  
      let remoteUser = await BitcapitalService.createConsumers({
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        taxId: req.body.taxId
      });
      
      return res.success(remoteUser);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
};
