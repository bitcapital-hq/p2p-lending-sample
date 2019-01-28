export default class Helpers {
  public static totalInterest(interest: number, amount: number, instalments: number): number {
    return (amount * (interest / 100)) * instalments;
  }
}