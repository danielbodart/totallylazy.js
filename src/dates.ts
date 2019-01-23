import {lazy} from "./lazy";
import {PrefixTree} from "./trie";
import {flatten, unique} from "./arrays";
import DateTimeFormatPart = Intl.DateTimeFormatPart;
import DateTimeFormatPartTypes = Intl.DateTimeFormatPartTypes;

declare global {
    interface String {
        toLocaleLowerCase(locale?: string): string;

        toLocaleUpperCase(locale?: string): string;
    }
}


export function date(year: number, month?: number, day?: number): Date {
    return new Date(year, month ? month - 1 : 1, day ? day : 1);
}

export type MonthFormat = 'numeric' | '2-digit' | 'short' | 'long';

export interface Options {
    year?: 'numeric' | '2-digit';
    month?: MonthFormat;
    day?: 'numeric' | '2-digit';
    weekday?: 'short' | 'long';
}

export const defaultOptions: Options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: 'long',
};

export class Formatters {
    static cache: { [key: string]: Intl.DateTimeFormat } = {};

    static create(locale: string = 'default', options: Options = defaultOptions) {
        const key = JSON.stringify({locale, options});
        return Formatters.cache[key] = Formatters.cache[key] || new Intl.DateTimeFormat(locale, options);
    }
}

export function format(value: Date, locale?: string, options: Options = defaultOptions): string {
    return Formatters.create(locale, options).format(value);
}

export function formatData(value: Date, locale?: string, options: Options = defaultOptions): DateTimeFormatPart[] {
    return Formatters.create(locale, options).formatToParts(value);
}

export function parse(value: string, locale?: string, options?: string | Options): Date {
    return parser(locale, options).parse(value);
}

function replace(regex: RegExp, value: string, replacer: (match: RegExpExecArray) => string, nonMatchedReplacer: (a: string) => string = (value) => value) {
    const result = [];

    let position = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(value)) != null) {
        result.push(nonMatchedReplacer(value.substring(position, match.index)));
        result.push(replacer(match));
        position = regex.lastIndex;
    }
    result.push(nonMatchedReplacer(value.substring(position)));

    return result.join("");
}

export class RegexBuilder {
    constructor(private locale: string,
                        private options: Options = defaultOptions,
                        private formatted: DateTimeFormatPart[]) {
    }

    static cache: { [key: string]: RegexBuilder } = {};

    static create(locale: string = 'default', options: string | Options = defaultOptions): RegexBuilder {
        const key = JSON.stringify({locale, options});
        return RegexBuilder.cache[key] = RegexBuilder.cache[key] || (() => {
            if(typeof options == 'string'){
                return formatBuilder(locale, options);
            } else {
                return new RegexBuilder(locale, options, formatData(new Date(), locale, options));
            }
        })();
    }

    @lazy get months(): Months {
        return Months.get(this.locale);
    }

    @lazy get weekdays(): string[] {
        return weekdays(this.locale, this.options).map(l => l.toLocaleLowerCase(this.locale));
    }

    @lazy get regexParser(): RegexParser {
        const namedPattern = this.formatted.map(part => {
            switch (part.type) {
                case "year": return '(?<year>\\d{4})';
                case "month": return `(?<month>(?:\\d{1,2}|[${this.months.characters()}]+))`;
                case "day": return '(?<day>\\d{1,2})';
                case "weekday": return `(?<weekday>(?:${this.weekdays.join('|')}))`;
                default: return `[${part.value}]*?`;
            }
        }).join("");

        const {names, pattern} = namedGroups(namedPattern);

        const groups = {
            year: numeric(names['year']),
            month: parseMonth(names['month'], this.months),
            day: numeric(names['day']),
            weekday: lookup(names['weekday'], this.weekdays),
        };

        return new RegexParser(new RegExp(pattern), groups, this.locale);
    }
}

export interface Names {
    [key: string]: number;
}

export interface NamedGroups {
    names: Names;
    pattern: string;
}

const namesRegex = /\(\?<([^>]+)>/g;

export function namedGroups(originalPattern:string): NamedGroups{
    let index = 0;
    const names: Names = {};
    const pattern = replace(namesRegex, originalPattern, match => {
        names[match[1]] = ++index;
        return '(';
    });
    return {names, pattern};
}

const formatRegex = /(?:(y+)|(M+)|(d+)|(E+))/g;

function typeFrom(value:string): DateTimeFormatPartTypes {
    if(value.indexOf('y') != -1) return 'year';
    if(value.indexOf('M') != -1) return 'month';
    if(value.indexOf('d') != -1) return 'day';
    if(value.indexOf('E') != -1) return 'weekday';
    throw new Error(`Illegal Argument: ${value}`);
}

function formatFrom(type:DateTimeFormatPartTypes, length:number): string {
    switch (type) {
        case "year" : switch (length) {
            case 4: return "numeric";
            case 2: return "2-digit";
        }
        case "month" : switch (length) {
            case 4: return "long";
            case 3: return "short";
            case 2: return "2-digit";
            case 1: return "numeric";
        }
        case "day" :switch (length) {
            case 2: return "2-digit";
            case 1: return "numeric";
        }
        case "weekday":switch (length) {
            case 4: return "long";
            case 3: return "short";
        }
    }
    throw new Error(`Illegal Argument: ${type} ${length}`);
}

export function formatBuilder(locale:string, format:string): RegexBuilder{
    const parts: DateTimeFormatPart[] = [];
    replace(formatRegex, format, match => {
        const type = typeFrom(match[0]);
        const value = formatFrom(type, match[0].length);
        parts.push({type, value});
        return "";
    }, a => {
        if(a) parts.push({type:"literal", value:a});
        return "";
    });

    const keys = ['year', 'month', 'day', 'weekday'];
    const options: Options = parts.filter(p => keys.indexOf(p.type) != -1).reduce((a,p) => {
        a[p.type] = p.value;
        return a;
    }, {} as any);

    return new RegexBuilder(locale, options, parts)
}

export type OptionHandler = (match: RegExpMatchArray) => number;

export const numeric = (index: number): OptionHandler => (match: RegExpMatchArray): number => {
    return parseInt(match[index]);
};

export const lookup = (index: number, months: string[]): OptionHandler => (match: RegExpMatchArray): number => {
    return months.indexOf(match[index]) + 1;
};

export const parseMonth = (index: number, months: Months): OptionHandler => (match: RegExpMatchArray): number => {
    return months.parse(match[index]).number;
};

export const defaultParserOptions: Options[] = [
    {year: 'numeric', month: 'long', day: 'numeric', weekday: "long"},
    {year: 'numeric', month: 'short', day: 'numeric', weekday: 'short'},
    {year: 'numeric', month: 'numeric', day: 'numeric'},
    {year: 'numeric', month: 'short', day: 'numeric'},
    {year: 'numeric', month: 'long', day: 'numeric'},
];

export function parser(locale?: string, options?: string | Options): DateParser {
    if (typeof options == 'string') {
        return simpleParser(locale, options);
    } else {
        return localeParser(locale, options);
    }
}

export function simpleParser(locale: string = 'default', format: string): DateParser {
    return RegexBuilder.create(locale, format).regexParser;
}

export function localeParser(locale?: string, options?: Options): DateParser {
    if (!options) {
        return parsers(...defaultParserOptions.map(o => localeParser(locale, o)))
    }
    return RegexBuilder.create(locale, options).regexParser;
}

export function months(locale?: string, monthFormat: MonthFormat | Options = 'long'): string[] {
    const options: Options = typeof monthFormat == 'string' ? {month: monthFormat} : monthFormat;
    delete options.weekday;
    const result = [];

    const formatter = Formatters.create(locale, options);
    const native = typeof formatter.formatToParts == 'function';
    const exact = Object.keys(options).length == 1 || native;

    for (let i = 1; i <= 12; i++) {
        if(native) {
            result.push(formatter.formatToParts(date(2000, i, 1)).filter(p => p.type === 'month').map(p => p.value).join(""));
        } else {
            result.push(formatter.format(date(2000, i, 1)));
        }
    }

    return exact ? result : different(result);
}

export interface Month {
    number: number;
    name: string;
}


export class Months {
    static formats: Options[] = [
        {month: "long"}, {month: "short"},
        {year: 'numeric', month: "long", day: 'numeric'},
        {year: 'numeric', month: 'short', day: '2-digit'}
        ];
    static cache: { [key: string]: Months } = {};

    static get(locale: string = 'default', additionalData: Month[] = []): Months {
        return Months.cache[locale] = Months.cache[locale] || Months.create(locale, additionalData);
    }

    static set(locale: string = 'default', months: Months): Months {
        return Months.cache[locale] = months;
    }

    static create(locale: string = 'default', additionalData: Month[] = []): Months {
        return new Months(locale, [...Months.generateData(locale), additionalData]);
    }

    static generateData(locale: string = 'default'): Month[][] {
        return Months.formats.map(f => months(locale, f).map((m, i) => ({name: m, number: i + 1})));
    }

    private readonly index: Month[];
    private readonly prefixTree: PrefixTree<number>;

    constructor(public locale: string, data: Month[][]) {
        this.prefixTree = flatten(data).reduce((t, m) => {
            return t.insert(m.name.toLocaleLowerCase(this.locale), m.number);
        }, new PrefixTree<number>());
        ([this.index] = data);
    }

    parse(value: string): Month {
        const number = parseInt(value);
        if (!isNaN(number)) return this.get(number);

        const months = unique(this.prefixTree.match(value.toLocaleLowerCase(this.locale)));
        if (months.length != 1) throw new Error(`Unable to parse: ${value} matched months: ${JSON.stringify(months)}`);
        const [month] = months;
        return this.get(month);
    }

    get(number: number): Month {
        if (number > 0 && number <= 12) return this.index[number - 1];
        throw new Error("Illegal argument: month number must be between 1 and 12 but was: " + number);
    }

    characters(): string {
        return this.prefixTree.keys.join("");
    }
}

export function weekdays(locale?: string, options: Options = defaultOptions): string[] {
    const result = [];
    for (let i = 1; i <= 7; i++) {
        result.push(format(date(2000, 1, i + 2), locale, {weekday: options.weekday}));
    }
    return result;
}

export function prefix(charactersA: string[], charactersB: string[]): number {
    for (let i = 0; i < charactersA.length; i++) {
        const characterA = charactersA[i];
        const characterB = charactersB[i];
        if (characterA != characterB) return i;
    }
    return charactersA.length;
}

export function suffix(charactersA: string[], charactersB: string[]): number {
    return prefix([...charactersA].reverse(), [...charactersB].reverse());
}

export function different(values: string[]): string[] {
    const characters = values.map(v => [...v]);

    const [smallestPrefix, smallestSuffix] = characters.reduce(([sp, ss], current, i) => {
        const next = i < characters.length - 1 ? characters[i + 1] : characters[0];
        const p = prefix(current, next);
        const s = suffix(current, next);
        return [p < sp ? p : sp, s < ss ? s : ss];
    }, [Number.MAX_VALUE, Number.MAX_VALUE]);

    return characters.map((current) => {
        return current.slice(smallestPrefix, -smallestSuffix).join('')
    });
}


export interface DateParser {
    parse(value: string): Date;
}

export class CompositeDateParser implements DateParser {
    constructor(private readonly parsers: DateParser[]) {
    }

    parse(value: string): Date {
        for (const parser of this.parsers) {
            try {
                const result = parser.parse(value);
                if (result) return result;
            } catch (ignore) {
            }
        }
        throw new Error("Unable to parse date: " + value);
    }
}

export function parsers(...parsers: DateParser[]): DateParser {
    return new CompositeDateParser(parsers);
}

export interface RegexGroups {
    year: OptionHandler;
    month: OptionHandler;
    day: OptionHandler;
    weekday: OptionHandler;
}

export class RegexParser implements DateParser {
    constructor(private regex: RegExp, private groups: RegexGroups, private locale?: string) {
    }

    parse(value: string): Date {
        const match = value.toLocaleLowerCase(this.locale).match(this.regex);
        if (!match) throw new Error(`Locale: ${this.locale} ${this.regex} did not match ${value}`);
        return date(this.groups.year(match), this.groups.month(match), this.groups.day(match));
    }
}
