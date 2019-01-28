import * as CPF from 'cpf';

export default class ValidatorHelper {
  public static async isValidName(name: string): Promise<boolean> {
    return new RegExp(/^[a-zA-Z\s]*$/).test(name)
  }

  public static async isValidPassword(password: string): Promise<boolean> {
    return new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/).test(password) && password.length > 5;
  }

  public static async isValidCPF(cpf: string): Promise<boolean> {
    return CPF.isValid(cpf);
  }

  public static async isNotEmpty(param: string | number | boolean): Promise<boolean> {
    return !!param;
  }

  public static async isValidMoney(money: string): Promise<boolean> {
    return !isNaN(parseFloat(money));
  }

  public static async isValidCountryCode(code: string): Promise<boolean> {
    //TODO really validate
    return true;
  }

  public static async isValidLocalCode(code: string): Promise<boolean> {
    //TODO really validate
    return true;
  }

  public static async isValid(code: string): Promise<boolean> {
    //TODO really validate
    return true;
  }

  public static async isValidInt(amount: string): Promise<boolean> {
    return new RegExp(/^[0-9]+$/).test(amount);
  }
}