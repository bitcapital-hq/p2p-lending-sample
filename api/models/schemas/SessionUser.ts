import { User } from "bitcapital-core-sdk";
export default class SessionUser extends User {
  DBId: string;
  walletId: string;
}