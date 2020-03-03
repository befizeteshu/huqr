const Joi = require('@hapi/joi');
const IBAN = require('iban');
const { format } = require('date-fns-tz');
const { parse } = require('date-fns');

import { CustomHelpers, ErrorReport } from '@hapi/joi';

const huChars = /^[\x20-\x7eáíűőüöúóéÁÍŰŐÜÖÚÓÉ]*$/;
const validPurposeCodes = ['ACCT','ADVA','AGRT','AIRB','ALMY','ANNI','ANTS','AREN','BECH','BENE','BEXP','BOCE','BONU','BUSB','CASH','CBFF','CBTV','CCRD','CDBL','CFEE','CHAR','CLPR','CMDT','COLL','COMC','COMM','COMT','COST','CPYR','CSDB','CSLP','CVCF','DBTC','DCRD','DEPT','DERI','DIVD','DMEQ','DNTS','ELEC','ENRG','ESTX','FERB','FREX','GASB','GDDS','GDSV','GOVI','GOVT','GSCB','GVEA','GVEB','GVEC','GVED','HEDG','HLRP','HLTC','HLTI','HREC','HSPC','HSTX','ICCP','ICRF','IDCP','IHRP','INPC','INSM','INSU','INTC','INTE','INTX','LBRI','LICF','LIFI','LIMA','LOAN','LOAR','LTCF','MDCS','MSVC','NETT','NITX','NOWS','NWCH','NWCM','OFEE','OTHR','OTLC','PADD','PAYR','PENS','PHON','POPE','PPTI','PRCP','PRME','PTSP','RCKE','RCPT','REFU','RENT','RINP','RLWY','ROYA','SALA','SAVG','SCVE','SECU','SSBE','STDY','SUBS','SUPP','TAXS','TELI','TRAD','TREA','TRFD','VATX','VIEW','WEBI','WHLD','WTER'];

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
  purpose: Joi
    .string()
    .valid(...validPurposeCodes)
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

  getValidUntil(): Date | undefined {
    if (!this.validUntil) return undefined;
    const standardTimeStamp = this.validUntil.substring(0, 14) + '+0' + this.validUntil.substring(15);
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
