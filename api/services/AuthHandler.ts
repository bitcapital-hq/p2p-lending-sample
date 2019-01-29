import { StorageUtil, MemoryStorage } from "bitcapital-core-sdk";
import { BaseRequest, BaseResponse, HttpError } from "ts-framework";
import { BaseError } from "ts-framework-common";
import BitcapitalService from "./BitcapitalService";
import { User } from "../models";
import ErrorParser from "./ErrorParser";

export default class AuthHandler {
  protected static storage: StorageUtil = new StorageUtil('userSession', new MemoryStorage());

  public static async auth(req: BaseRequest, res: BaseResponse, next: Function) {
    try {
      let authenticatedUser = await BitcapitalService.authenticate(req.body.username, req.body.password);
      let dbUser = await User.findByBitCapitalId(authenticatedUser.id);
      let sessionUser = {
        ...authenticatedUser,
        DBId: dbUser.id
      }

      AuthHandler.storage.put(authenticatedUser.credentials.accessToken, sessionUser);

      req.body = { token: authenticatedUser.credentials.accessToken };

      next();
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }

  public static async verify(req: BaseRequest, res: BaseResponse, next: Function) {
    if (!req.headers.authorization) {
      throw new HttpError('No authorization headers', 400);
    }

    try {
      let token = req.headers.authorization.replace('Bearer ', '');
      let apiClient = await BitcapitalService.getAPIClient();
      let user = await apiClient.oauth().secret(token, { entity: 'wallet', id: null });
      let isValid = await user.isValid();
      
      if (isValid) {
        req.user = await AuthHandler.storage.get(token);

        return next();
      }

      throw new BaseError('Trying to authenticate an invalid user! Status 401');
    } catch(e) {
      let error = new ErrorParser(e);

      throw new HttpError(error.error, error.status);
    }
  }
}