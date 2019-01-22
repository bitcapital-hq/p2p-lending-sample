import { StorageUtil, MemoryStorage } from "bitcapital-core-sdk";
import { BaseRequest, BaseResponse, HttpError } from "ts-framework";
import { BaseError } from "ts-framework-common";
import BitcapitalService from "./BitcapitalService";
import ErrorParser from "./ErrorParser";

export default class HandleAuth {
  protected static storage: StorageUtil = new StorageUtil('userSession', new MemoryStorage());

  public static async auth(req: BaseRequest, res: BaseResponse, next: Function) {
    try {
      BitcapitalService.getAPIClient();
      let authenticatedUser = await BitcapitalService.authenticate(req.body.username, req.body.password);

      HandleAuth.storage.put(authenticatedUser.credentials.accessToken, authenticatedUser);

      req.body = {
        token: authenticatedUser.credentials.accessToken
      };

      next();
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }

  public static async verify(req: BaseRequest, res: BaseResponse, next: Function) {
    if (!req.headers.authorization) {
      throw new HttpError('No authorization headers', 400);
    }

    try {
      let token = req.headers.authorization.replace('Bearer ', '');
      let apiClient = await BitcapitalService.getAPIClient();
      let user = await apiClient.oauth()
        .secret(token, { entity: 'wallet', id: null });
      let isValid = await user.isValid();

      if (isValid) {
        req.user = await HandleAuth.storage.get(token);
        return next();
      }

      throw new BaseError('Trying to authenticate an invalid user! Status 401');
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.parseError(), error.parseStatus());
    }
  }
}