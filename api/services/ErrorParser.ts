import { HttpCode } from 'ts-framework';

export default class ErrorParser {
  public e: any;
  public error;
  public status;

  constructor(e: any) {
    console.log(e);
    console.log("--------------------- ERROR PARSER CLASS ---------------------");
    this.e = e.data ? e.data : e;
    this.error = this.parseError();
    this.status = this.parseStatus();
  }

  private parseError(): string {
    return this.e.message;
  }

  private parseStatus(): number {
    switch (true) {
      case this.e.status : return this.e.status;
      case this.e.message.includes('400') : return HttpCode.Client.BAD_REQUEST;
      case this.e.message.includes('404') : return HttpCode.Client.NOT_FOUND;
      case this.e.message.includes('401') : return HttpCode.Client.UNAUTHORIZED;
      case this.e.message.includes('403') : return HttpCode.Client.FORBIDDEN;
      default : return HttpCode.Server.INTERNAL_SERVER_ERROR;
    }
  }
}