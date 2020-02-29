const Joi = require('@hapi/joi');
const IBAN = require('iban');

import { CustomHelpers, ErrorReport } from '@hapi/joi';

const huChars = /^[\x20-\x7eáíűőüöúóéÁÍŰŐÜÖÚÓÉ]*$/;

function ibancheck(value: string, helpers: CustomHelpers): string | ErrorReport {
  if (!IBAN.isValid(value)) {
    return helpers.error('invalid iban');
  }
  return value;
}

const schema = Joi.object({
  kind: Joi
    .string()
    .valid('HCT', 'RTP')
    .required(),
  version: Joi
    .string()
    .valid('001')
    .required(),
  charset: Joi
    .string()
    .valid('1')
    .required(),
  bic: Joi
    .string()
    .pattern(/^[0-9]+$/, 'numbers')
    .length(11)
    .required(),
  name: Joi
    .string()
    .pattern(huChars)
    .max(70)
    .required(),
  iban: Joi
    .string()
    .pattern(/^HU[0-9]+$/, 'iban')
    .length(28)
    .custom(ibancheck, 'iban check')
    .required(),
  amount: Joi
    .string()
    .pattern(/^HUF[0-9]+$/)
    .min(4)
    .max(15),
  validUntil: Joi
    .string()
    .pattern(/^[0-9]+\+[0-9]$/) // TODO more validation ? valid date, not in past
    .length(16)
    .required(),
  purpose: Joi // TODO purpose checker ?
    .string()
    .pattern(huChars)
    .length(4),
  message: Joi
    .string()
    .pattern(huChars)
    .max(70),
  shopId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  merchDevId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  invoiceId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  customerId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  credTranId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  loyaltyId: Joi
    .string()
    .pattern(huChars)
    .max(35),
  navCheckId: Joi
    .string()
    .pattern(huChars)
    .max(35)
});

// the order is important !
const  props = ['kind', 'version', 'charset', 'bic', 'name', 'iban', 'amount', 'validUntil', 'purpose',
  'message', 'shopId', 'merchDevId', 'invoiceId', 'customerId', 'credTranId', 'loyaltyId', 'navCheckId'] as const;

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
    if (lines.length !== (props.length + 1)) {
      // there is an LF after the last line so split returns an array with one more element
      return false;
    }
    for (let i=0; i<props.length; i++) {
      if (lines[i] !== '') {
        this[props[i]] = lines[i];
      }
    }
    return true;
  }

  toString() {
    let result = '';
    for (let i=0; i<props.length; i++) {
      result += this[props[i]] ?? '';
      result +=  '\n';
    }
    // TODO send warning if full length is over 345 chars
    return result;
  }
}
