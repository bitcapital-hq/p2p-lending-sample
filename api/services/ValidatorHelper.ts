import * as CPF from 'cpf';

export default class ValidatorHelper {
  public static async isValidName(name: string): Promise<Boolean> {
    return new RegExp(/^[a-zA-Z\s]*$/).test(name)
  }

  public static async isValidPassword(password: string): Promise<Boolean> {
    return new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/).test(password) && password.length > 5;
  }

  public static async isValidCPF(cpf: string): Promise<Boolean> {
    return CPF.isValid(cpf);
  }

  public static async isNotEmpty(param: string | number | boolean): Promise<Boolean> {
    return !!param;
  }

  public static async isValidMoney(money: string): Promise<Boolean> {
    return !isNaN(parseFloat(money));
  }
}