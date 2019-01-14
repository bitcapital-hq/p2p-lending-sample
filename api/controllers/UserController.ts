import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService' ;
import ParseErrorStatus from '../services/ParseErrorStatus';
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
      throw new HttpError(e.message, ParseErrorStatus.parseError(e));
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
        email: dbUser.email
      });
      
      return res.success(remoteUser);
    } catch (e) {
      throw new HttpError(e.message, ParseErrorStatus.parseError(e));
    }
  }
};
