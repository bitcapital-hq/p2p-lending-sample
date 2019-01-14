import { HttpCode } from 'ts-framework';

export default class ParseErrorStatus {
  public static parseError(e: Error) {
    switch (true) {
      case e.message.includes(' 400') : return HttpCode.Client.BAD_REQUEST;
      case e.message.includes(' 404') : return HttpCode.Client.NOT_FOUND;
      case e.message.includes(' 401') : return HttpCode.Client.UNAUTHORIZED;
      case e.message.includes(' 403') : return HttpCode.Client.FORBIDDEN;
      default : return HttpCode.Server.INTERNAL_SERVER_ERROR;
    }
  }
}