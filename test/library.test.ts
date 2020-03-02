import MNBQrCode from "../src/huqr";

process.env.TZ = 'Europe/Budapest';

function getValidInstance() {
  const code = new MNBQrCode();
  code.kind = 'HCT';
  code.version = '001';
  code.charset = '1';
  code.bic = '12345678901';
  code.name = 'Test Elek';
  code.iban = 'HU16100320000605635300000000';
  code.validUntil = '20201231235959+2';
  return code;
}

function expectError(code: MNBQrCode) {
  expect(code.isValid()).toBe(false);
}
function expectNoError(code: MNBQrCode) {
  expect(code.isValid()).toBe(true);
}

describe('joi definition test', () => {
  it('MNBQrCode is instantiable', () => {
    expect(new MNBQrCode()).toBeInstanceOf(MNBQrCode);
  });
  it('invalid after instantiation', () => {
    const code = new MNBQrCode();
    expectError(code);
  });
  it('code validation works', () => {
    const code = getValidInstance();
    code.kind = 'HCT';
    expectNoError(code);
    code.kind = 'RTP';
    expectNoError(code);
    code.kind = undefined;
    expectError(code);
  });
  it('version validation works', () => {
    const code = getValidInstance();
    code.version = '001';
    expectNoError(code);
    code.version = undefined;
    expectError(code);
  });
  it('charset validation works', () => {
    const code = getValidInstance();
    code.charset = '1';
    expectNoError(code);
    code.charset = undefined;
    expectError(code);
  });
  it('bic validation works', () => {
    const code = getValidInstance();
    code.bic = '12345678901';
    expectNoError(code);
    code.bic = undefined;
    expectError(code);
    code.bic = '1233456789012';
    expectError(code);
    code.bic = '12334567890A';
    expectError(code);
    code.bic = '12334567890😊';
    expectError(code);
  });
  it('name validation works', () => {
    const code = getValidInstance();
    code.name = 'Test Elek';
    expectNoError(code);
    code.name = 'árvíztűrő tükörfúrógép';
    expectNoError(code);
    code.name = 'ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP';
    expectNoError(code);
    code.name = undefined;
    expectError(code);
    code.name = '123345678901233456789012334567890123345678901233456789012334567890123345678901';
    expectError(code);
    code.name = 'Hakan Şükür';
    expectError(code);
  });
  it('iban validation works', () => {
    const code = getValidInstance();
    code.iban = 'HU16100320000605635300000000';
    expectNoError(code);
    code.iban = undefined;
    expectError(code);
    code.iban = '1234567890';
    expectError(code);
    code.iban = 'HU17100320000605635300000000'; // bad iban checksum
    expectError(code);
  });
  it('amount validation works', () => {
    const code = getValidInstance();
    code.amount = 'HUF1500';
    expectNoError(code);
    code.amount = undefined;
    expectNoError(code);
    code.amount = '1234567890';
    expectError(code);
    code.amount = 'HUF1234567890123';
    expectError(code);
    code.amount = 'HUF';
    expectError(code);
  });
  it('validUntil validation works', () => {
    const code = getValidInstance();
    code.validUntil = '20201231235959+2';
    expectNoError(code);
    code.validUntil = undefined;
    expectError(code);
    code.validUntil = '1234567890123456';
    expectError(code);
    code.validUntil = '12345678901234+A';
    expectError(code);
    // TODO check validity, read date, not in past
  });
  it('purpose validation works', () => {
    const code = getValidInstance();
    code.purpose = 'ACCT';
    expectNoError(code);
    code.purpose = undefined;
    expectNoError(code);
    code.purpose = '1234';
    expectError(code);
  });
  it('message validation works', () => {
    const code = getValidInstance();
    code.message = 'ABCD';
    expectNoError(code);
    code.message = undefined;
    expectNoError(code);
    code.message = '12345678901234567890123456789012345678901234567890123456789012345678901';
    expectError(code);
    code.message = '❤️';
    expectError(code);
  });
  it('shopId validation works', () => {
    const code = getValidInstance();
    code.shopId = 'ABCD';
    expectNoError(code);
    code.shopId = undefined;
    expectNoError(code);
    code.shopId = '123456789012345678901234567890123456';
    expectError(code);
    code.shopId = '❤️';
    expectError(code);
  });
  it('merchDevId validation works', () => {
    const code = getValidInstance();
    code.merchDevId = 'ABCD';
    expectNoError(code);
    code.merchDevId = undefined;
    expectNoError(code);
    code.merchDevId = '123456789012345678901234567890123456';
    expectError(code);
    code.merchDevId = '❤️';
    expectError(code);
  });
  it('invoiceId validation works', () => {
    const code = getValidInstance();
    code.invoiceId = 'ABCD';
    expectNoError(code);
    code.invoiceId = undefined;
    expectNoError(code);
    code.invoiceId = '123456789012345678901234567890123456';
    expectError(code);
    code.invoiceId = '❤️';
    expectError(code);
  });
  it('customerId validation works', () => {
    const code = getValidInstance();
    code.customerId = 'ABCD';
    expectNoError(code);
    code.customerId = undefined;
    expectNoError(code);
    code.customerId = '123456789012345678901234567890123456';
    expectError(code);
    code.customerId = '❤️';
    expectError(code);
  });
  it('credTranId validation works', () => {
    const code = getValidInstance();
    code.credTranId = 'ABCD';
    expectNoError(code);
    code.credTranId = undefined;
    expectNoError(code);
    code.credTranId = '123456789012345678901234567890123456';
    expectError(code);
    code.credTranId = '❤️';
    expectError(code);
  });
  it('loyaltyId validation works', () => {
    const code = getValidInstance();
    code.loyaltyId = 'ABCD';
    expectNoError(code);
    code.loyaltyId = undefined;
    expectNoError(code);
    code.loyaltyId = '123456789012345678901234567890123456';
    expectError(code);
    code.loyaltyId = '❤️';
    expectError(code);
  });
  it('navCheckId validation works', () => {
    const code = getValidInstance();
    code.navCheckId = 'ABCD';
    expectNoError(code);
    code.navCheckId = undefined;
    expectNoError(code);
    code.navCheckId = '123456789012345678901234567890123456';
    expectError(code);
    code.navCheckId = '❤️';
    expectError(code);
  });
  it('validUntil helpers work', () => {
    const code = getValidInstance();
    code.validUntil = undefined;
    expect(code.getValidUntil()).toEqual(undefined);
    const now = new Date();
    now.setMilliseconds(0);
    code.setValidUntil(now);
    expect(code.getValidUntil()?.getTime()).toEqual(now.getTime());
  });
  it('amount helpers work', () => {
    const code = getValidInstance();
    code.amount = undefined;
    expect(code.getFtAmount()).toBe(undefined);
    code.setFtAmount(1500);
    expect(code.amount).toBe('HUF1500');
    expect(code.getFtAmount()).toBe(1500);
    expect(() => { code.setFtAmount(1500.5); }).toThrowError('invalid amount');
    expect(() => { code.setFtAmount(-1500); }).toThrowError('invalid amount');
    expect(() => { code.setFtAmount(1000000000000); }).toThrowError('invalid amount');
  });
});

describe('read test', () => {
  it('can read from string', () => {
    const input = 'HCT\n001\n1\n12345678901\nTest Elek\nHU16100320000605635300000000\nHUF1500\n20201231235959+2\n\n\n\n\n\n\n\n\nTEST\n';
    const code = new MNBQrCode();
    expect(code.read(input)).toBe(true);
    expectNoError(code);
    expect(code.kind).toEqual('HCT');
    expect(code.version).toEqual('001');
    expect(code.charset).toEqual('1');
    expect(code.bic).toEqual('12345678901');
    expect(code.name).toEqual('Test Elek');
    expect(code.iban).toEqual('HU16100320000605635300000000');
    expect(code.amount).toEqual('HUF1500');
    expect(code.validUntil).toEqual('20201231235959+2');
    expect(code.navCheckId).toEqual('TEST');
  });
  it('no read if number of lines is not 18', () => {
    const input = 'HCT\n001\n1\n12345678901\nTest Elek\nHU16100320000605635300000000\nHUF1500\n20201231235959+2\n\n\n\n\n\n\n\n\n';
    const code = new MNBQrCode();
    expect(code.read(input)).toBe(false);
    expectError(code);
  });
});

describe('write test', () => {
  it('can write to a string', () => {
    const input = 'HCT\n001\n1\n12345678901\nTest Elek\nHU16100320000605635300000000\nHUF1500\n20201231235959+2\nACCT\n\n\n\n\n\n\n\n\n';
    const code = new MNBQrCode();
    expect(code.read(input)).toBe(true);
    expectNoError(code);
    const result = code.toString();
    expect(result).toEqual(input);
  });
});
