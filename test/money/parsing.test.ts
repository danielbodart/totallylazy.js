import {assert} from 'chai';
import {CurrencySymbols, format, money, parse, partsFrom} from "../../src/money/money";
import {locales} from "../dates/dates.test";
import {currencies} from "../../src/money/currencies";
import NumberFormatPart = Intl.NumberFormatPart;
import {runningInNode} from "../../src/node";
import {Weekdays} from "../../src/dates";

export const numberLocales = Intl.NumberFormat.supportedLocalesOf(locales);
const amounts = [1234567.89, 156, 156.89, .1234, 0];

describe("Money", function () {
    this.timeout(10000);

    const groupDelimetersFound = [',', '.', ' ', '’', ' '];
    // Contains narrow non breaking space - 8239

    it('can parse money with currency symbol', () => {
        const m = money('GBP', 123.45);
        const locale = 'en-GB';
        const symbol = format(m, locale, "symbol");
        const parsed = parse(symbol, locale);
        assert.deepEqual(parsed, money('GBP', 123.45));
    });

    it('can parse loads of money!', () => {
        for (const locale of numberLocales) {
            for (const [code, {decimals}] of Object.entries(currencies)) {
                for (const amount of amounts) {
                    const original = money(code, amount);
                    const expected = money(code, Number(amount.toFixed(decimals)));
                    const formatted = format(original, locale);
                    const parsed = parse(formatted, locale);
                    assert.deepEqual(parsed, expected);
                }
            }
        }
    });

    it('can convert parts to money', () => {
        const isoParts: NumberFormatPart[] = [{type: 'currency', value: 'EUR'},
            {type: 'literal', value: ' '},
            {type: 'integer', value: '1'},
            {type: 'group', value: ','},
            {type: 'integer', value: '234'},
            {type: 'group', value: ','},
            {type: 'integer', value: '567'},
            {type: 'decimal', value: '.'},
            {type: 'fraction', value: '89'}];

        assert.deepEqual(money(isoParts), money('EUR', 1234567.89));
    });

    it('can convert money to parts', () => {
        assert.deepEqual(partsFrom(money('EUR', 1234567.89)), [{type: 'currency', value: 'EUR'},
            {type: 'literal', value: ' '},
            {type: 'integer', value: '1'},
            {type: 'group', value: ','},
            {type: 'integer', value: '234'},
            {type: 'group', value: ','},
            {type: 'integer', value: '567'},
            {type: 'decimal', value: '.'},
            {type: 'fraction', value: '89'}]);
    });

    it('can parse some real examples', () => {
        assert.deepEqual(parse('£157', 'en-GB'), money('GBP', 157));
        assert.deepEqual(parse('US$274', 'ko-KR'), money('USD', 274));
        assert.deepEqual(parse('274 US$', 'pt-PT'), money('USD', 274));
        assert.deepEqual(parse('CA$315', 'en-US'), money('CAD', 315));
        assert.deepEqual(parse('315 $CA', 'fr-FR'), money('CAD', 315));
    });
});


describe("CurrencySymbols", function () {
    before(function () {
        if (runningInNode() && process.env.NODE_ICU_DATA != './node_modules/full-icu') {
            console.log("To run these tests you must set 'NODE_ICU_DATA=./node_modules/full-icu'");
            this.skip();
        }
    });

    it('is flexible in parsing as long as there is a unique match', () => {
        const fr = CurrencySymbols.get('fr-FR');
        assert.deepEqual(fr.parse('$CA'), 'CAD');
        assert.deepEqual(fr.parse('CAD'), 'CAD');
    });

    it('can get pattern', () => {
        const ru = CurrencySymbols.get('ru');
        assert.deepEqual(ru.pattern, '[$ABCDEFGHIJKLMNOPQRSTUVWXYZ£¥МТ฿₩₪₫€₴₹₽]{1,4}');
        assert.deepEqual(new RegExp(ru.pattern).test('$CA'), true);
    });

    it('can also parse the normal ISO code', () => {
        const ru = CurrencySymbols.get('ru');
        assert.deepEqual(ru.parse('USD'), 'USD');
    });
});



