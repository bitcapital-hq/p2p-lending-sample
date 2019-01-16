import * as CPF from 'cpf';

export default class ValidatorHelper {
  public static async isValidName(name: string) {
    return new RegExp(/^[a-zA-Z\s]*$/).test(name)
  }

  public static async isValidPassword(password: string) {
    return new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/).test(password) && password.length > 5;
  }

  public static async isValidCPF(cpf: string) {
    return CPF.isValid(cpf);
  }

  public static async isNotEmpty(param: string | number | boolean) {
    return !!param;
  }
}