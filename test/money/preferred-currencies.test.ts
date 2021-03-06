import {assert} from 'chai';
import {PreferredCurrencies} from "../../src/money/preferred-currencies";

describe('PreferredCurrencies', () => {
    it('dollarSymbol', () => {
        assert.deepEqual(PreferredCurrencies.dollarSymbol('AG'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('AU'), 'AUD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('BS'), 'BSD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('BB'), 'BBD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('BZ'), 'BZD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('BM'), 'BMD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('BN'), 'BND');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('CA'), 'CAD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('DM'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('EC'), 'USD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('FM'), 'USD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('KY'), 'KYD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('FJ'), 'FJD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('GD'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('GY'), 'GYD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('HK'), 'HKD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('JM'), 'JMD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('KI'), 'AUD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('KN'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('LC'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('LR'), 'LRD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('MH'), 'USD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('NA'), 'NAD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('NZ'), 'NZD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('SG'), 'SGD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('SB'), 'SBD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('SR'), 'SRD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('SV'), 'USD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('TL'), 'USD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('TW'), 'TWD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('TT'), 'TTD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('TV'), 'AUD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('VC'), 'XCD');
        assert.deepEqual(PreferredCurrencies.dollarSymbol('ZW'), 'USD');
    });

    it('does not switch dinar to dollar', () => {
        assert.deepEqual(PreferredCurrencies.dollarSymbol('SD'), 'USD');
    });

    it('poundSymbol', () => {
        assert.deepEqual(PreferredCurrencies.poundSymbol('EG'), 'EGP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('FK'), 'FKP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('GI'), 'GIP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('GG'), 'GBP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('IM'), 'GBP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('JE'), 'GBP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('LB'), 'LBP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('SH'), 'SHP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('SS'), 'SSP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('SD'), 'SDG');
        assert.deepEqual(PreferredCurrencies.poundSymbol('SY'), 'SYP');
        assert.deepEqual(PreferredCurrencies.poundSymbol('GB'), 'GBP');
    });

    it('yenSymbol', () => {
        assert.deepEqual(PreferredCurrencies.yenSymbol('CN'), 'CNY');
        assert.deepEqual(PreferredCurrencies.yenSymbol('JP'), 'JPY');
    });

    it('kroneSymbol', () => {
        assert.deepEqual(PreferredCurrencies.kroneSymbol('DK'), 'DKK');
        assert.deepEqual(PreferredCurrencies.kroneSymbol('FO'), 'DKK');
        assert.deepEqual(PreferredCurrencies.kroneSymbol('GL'), 'DKK');
        assert.deepEqual(PreferredCurrencies.kroneSymbol('IS'), 'ISK');
        assert.deepEqual(PreferredCurrencies.kroneSymbol('NO'), 'NOK');
        assert.deepEqual(PreferredCurrencies.kroneSymbol('SE'), 'SEK');
    });

    it('rupeeSymbol', () => {
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('IN'), 'INR');
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('ID'), 'IDR');
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('MU'), 'MUR');
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('NP'), 'NPR');
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('PK'), 'PKR');
        assert.deepEqual(PreferredCurrencies.rupeeSymbol('LK'), 'LKR');
    });

    it('for', () => {
        assert.deepEqual(PreferredCurrencies.for('GB'), ['USD', 'GBP', 'JPY', 'DKK', 'INR']);
        assert.deepEqual(PreferredCurrencies.for('AU'), ['AUD', 'GBP', 'JPY', 'DKK', 'INR']);
        assert.deepEqual(PreferredCurrencies.for('SD'), ['USD', 'SDG', 'JPY', 'DKK', 'INR']);
        assert.deepEqual(PreferredCurrencies.for('CN'), ['USD', 'GBP', 'CNY', 'DKK', 'INR']);
        assert.deepEqual(PreferredCurrencies.for('PK'), ['USD', 'GBP', 'JPY', 'DKK', 'PKR']);
        assert.deepEqual(PreferredCurrencies.for(undefined), ['USD', 'GBP', 'JPY', 'DKK', 'INR']);
    });
});