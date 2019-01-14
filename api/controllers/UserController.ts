import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService' ;
import ErrorParser from '../services/ErrorParser';
import { User } from '../models';

@Controller("/users")
export default class UserController {
  /**
   * GET /users
   * @description List users
   */
  @Get("/")
  static async getUsers(req: BaseRequest, res: BaseResponse) {
    let data: object = await BitcapitalService.getAPIClient();
    return res.success(data);
  }
  @Post("/authenticate")
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
  @Post("/", [])
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
  
      let remoteUser = await bitcapital.consumers().create({
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        consumer: {
          taxId: req.body.taxId
        } as any        
      });
      
      return res.success(remoteUser);
    } catch (e) {
      let error = new ErrorParser(e);
      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
};
