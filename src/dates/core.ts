import {DateFactory} from "./parsing";

declare global {
    interface String {
        toLocaleLowerCase(locale: string): string;

        toLocaleUpperCase(locale: string): string;
    }
}

export function date(year: number, month?: number, day?: number): Date {
    if (month && (month < 1 || month > 12)) throw new Error(`Invalid month ${month}`);
    if (day && (day < 1 || day > 31)) throw new Error(`Invalid day ${day}`);
    const date = new Date(Date.UTC(year, month ? month - 1 : 0, day ? day : 1));
    if(year !== date.getUTCFullYear()) throw new Error(`Invalid year ${year}`);
    if(month && month !== (date.getUTCMonth() + 1)) throw new Error(`Invalid month ${month}`);
    if(day && day !== date.getUTCDate()) throw new Error(`Invalid day ${day}`);
    return date;
}

export type MonthFormat = 'numeric' | '2-digit' | 'short' | 'long';
export type WeekdayFormat = 'short' | 'long';


/**
 * Format:
 *  Year
 *      yy: 2 digit (01)
 *      yyyy: numeric (normally 4 digit)
 *  Month
 *      M: numeric (1 or 10)
 *      MM: 2 digit (01)
 *      MMM: short (Jan)
 *      MMMM: long (January)
 *  Day
 *      d: numeric (1 or 10)
 *      dd: 2 digit (01)
 *  Weekday
 *      EEE: short (Mon)
 *      EEEE: long (Monday)
 */
export type Format = string;

export interface Options {
    year?: 'numeric' | '2-digit';
    month?: MonthFormat;
    day?: 'numeric' | '2-digit';
    weekday?: WeekdayFormat;
    separators?: string;
    format?: Format;
    factory?: DateFactory;
}

export const defaultOptions: Options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: 'long'
};

