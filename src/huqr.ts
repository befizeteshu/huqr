import { format } from 'date-fns-tz';
import { parse } from 'date-fns';

import { schema } from './schema';

// the order is important !
const props = [
  'kind',
  'version',
  'charset',
  'bic',
  'name',
  'iban',
  'amount',
  'validUntil',
  'purpose',
  'message',
  'shopId',
  'merchDevId',
  'invoiceId',
  'customerId',
  'credTranId',
  'loyaltyId',
  'navCheckId',
] as const;

export default class MNBQrCode {
  kind?: string;
  version?: string;
  charset?: string;
  bic?: string;
  name?: string;
  iban?: string;
  amount?: string;
  validUntil?: string;
  purpose?: string;
  message?: string;
  shopId?: string;
  merchDevId?: string;
  invoiceId?: string;
  customerId?: string;
  credTranId?: string;
  loyaltyId?: string;
  navCheckId?: string;

  validate() {
    return schema.validate(this);
  }

  isValid() {
    return this.validate().error === undefined;
  }

  read(value: string): boolean {
    const lines = value.split('\n');
    if (lines.length !== props.length + 1) {
      // there is an LF after the last line so split returns an array with one more element
      return false;
    }
    for (let i = 0; i < props.length; i++) {
      if (lines[i] !== '') {
        this[props[i]] = lines[i];
      }
    }
    return true;
  }

  toString() {
    let result = '';
    for (let i = 0; i < props.length; i++) {
      result += this[props[i]] ?? '';
      result += '\n';
    }
    // TODO send warning if full length is over 345 chars
    return result;
  }

  getValidUntil(): Date | undefined {
    if (!this.validUntil) return undefined;
    const standardTimeStamp =
      this.validUntil.substring(0, 14) + '+0' + this.validUntil.substring(15);
    const result: Date = parse(standardTimeStamp, 'yyyyMMddHHmmssX', new Date());
    result.setMilliseconds(0);
    return result;
  }
  setValidUntil(date: Date) {
    // TODO check for valid tz, 0-9 acceptable only
    let standardTimeStamp = format(date, 'yyyyMMddHHmmssX'); // timezone is +01
    let tz = standardTimeStamp.substring(16, 17);
    // TODO X might return +Z ?
    this.validUntil = standardTimeStamp.substring(0, 14) + '+' + tz;
  }
  getFtAmount(): number | undefined {
    if (!this.amount) return undefined;
    return parseInt(this.amount.substr(3), 10);
  }
  setFtAmount(amount: number) {
    if (!Number.isInteger(amount) || amount < 0 || amount > 999999999999) {
      throw new Error('invalid amount');
    }
    this.amount = `HUF${amount}`;
  }
}
