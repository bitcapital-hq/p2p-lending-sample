import { Controller, Get, BaseRequest, BaseResponse, Post, HttpError, HttpCode } from 'ts-framework';
import BitcapitalService from '../services/BitcapitalService' ;
import ParseErrorStatus from '../services/ParseErrorStatus';

@Controller("/users")
export default class UserController {
  /**
   * GET /users
   * @description List users
   */
  @Get("/")
  static async getUsers(req: BaseRequest, res: BaseResponse) {
    console.log('AFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTERAFTER')
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
};
