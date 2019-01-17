import Recipient from './Recipient';

export default class Payment {
  source: string;
  recipients: Recipient[];
  asset?: string;
};