import BitcapitalService from "./BitcapitalService";
import { BaseRequest, BaseResponse, HttpError } from "ts-framework";
import { BaseError } from "ts-framework-common";
import ErrorParser from "./ErrorParser";

export default class HandleAuth {
  public static async auth(req: BaseRequest, res: BaseResponse, next: Function) {
    try {
      BitcapitalService.getAPIClient();
      let authenticatedUser = await BitcapitalService.authenticate(req.body.username, req.body.password);

      req.user = authenticatedUser;
      req.body = {
        token: authenticatedUser.credentials.accessToken,
        refreshToken: authenticatedUser.credentials.refreshToken
      };

      next();
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }

  public static async verify(req: BaseRequest, res: BaseResponse, next: Function) {
    try {
      let token = req.headers.authorization.replace('Bearer ', '');
      let apiClient = await BitcapitalService.getAPIClient();
      let user = await apiClient.oauth()
        .secret(token, { entity: 'wallet', id: null });
      let isValid = await user.isValid();

      if (isValid) {
        req.user = user;
        return next();
      }

      throw new BaseError('Trying to authenticate an invalid user! Status 401');
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
}