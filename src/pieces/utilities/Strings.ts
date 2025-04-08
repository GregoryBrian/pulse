import { Utility } from '@sapphire/plugin-utilities-store';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { isNullOrUndefined } from '@sapphire/utilities';

export class StringUtilities extends Utility {
  public constructor(context: Utility.LoaderContext) {
    super(context, { name: StringUtilities.Name });
  }

  /**
   * Converts a number into a roman numeral.
   * @param num The number.
   * @returns The roman numeral.
   */
  public toRomanNumeral = (num: number): string => {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const romans = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];

    let roman = '';
    let index = 0;

    while (index < romans.length) {
      roman += romans.at(index)!.repeat(num / values.at(index)!);
      num %= values.at(index)!;
      index++;
    }

    return roman;
  };

  /**
   * Joins strings with a newline.
   * @param strings The strings.
   * @returns The formatted string.
   */
  public createStackedText = (...strings: string[] | string[][]): string => {
    return strings.flat(Infinity).join('\n');
  };

  /**
   * Lists strings as an inline list. This joins "and" between the last two strings.
   * @param strings The strings.
   * @returns The formatted string.
   */
  public createInlineText = (...strings: string[]): string => {
    return new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction'
    }).format(strings);
  };

  /**
   * Creates a discord snowflake.
   * @info Use {@link BigInt.prototype.toString BigInt.toString()} to convert the returned value into a string.
   * @param timestamp A distinct timestamp.
   * @returns A bigint.
   */
  public createDiscordSnowflake = (timestamp: ReturnType<typeof Date.now>): bigint => {
    return DiscordSnowflake.generate({ timestamp });
  };

  /**
   * Converts a number into its ordinal variant.
   * @param number The number.
   * @param commas If the converter should format the number to contain commas or not.
   * @returns An ordinal number.
   */
  public toOrdinalNumber = (number: number, commas: boolean): string => {
    let suffix: string;

    switch ([number % 10, true]) {
      case [1, number % 100 !== 11]: {
        suffix = 'st';
        break;
      }

      case [2, number % 100 !== 12]: {
        suffix = 'nd';
        break;
      }

      case [3, number % 100 !== 13]: {
        suffix = 'rd';
        break;
      }

      default: {
        suffix = 'th';
        break;
      }
    }

    return `${commas ? number.toLocaleString() : number}${suffix}`;
  };

  /**
   * Formats a number into a percentage. Automatically suffixed by a %.
   * @param value The value.
   * @param base The "total" value.
   * @param fractionDigits The amount of decimals to preserve.
   * @returns A formatted percentage.
   */
  public toPercent = (value: number, base: number, fractionDigits = 0): string => {
    return `${(Math.round((value / base) * 100) || 0).toFixed(fractionDigits)}%`;
  };

  /**
   * Creates a unique 6-character short identifier based on a specific date.
   * @param date The date.
   * @returns A unique ID.
   */
  public createId = (date: number | Date): string => {
    return Math.round((date instanceof Date ? date.getTime() : date) * 0xffffff)
      .toString(36)
      .toUpperCase()
      .slice(-8, -2);
  };

  /**
   * Shortens a number into its nearest highest place value.
   * @param value The value.
   * @param fractionDigits The amount of decimals to preserve.
   * @returns A shortened number.
   */
  public shortenNumber = (value: number, fractionDigits: number): string => {
    return Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: fractionDigits
    }).format(value);
  };

  /**
   * Formats the numbers to {@link StringUtilities.PaddedListAlignment align}.
   * @param numbers The numbers to format.
   * @param align The alignment type.
   * @returns An array of {@link StringUtilities.PaddedListItem}.
   */
  public createPaddedList = (numbers: number[], align: StringUtilities.PaddedListAlignment): StringUtilities.PaddedListItem[] => {
    return numbers.map<StringUtilities.PaddedListItem>((value) => {
      const firstVal = numbers.at(0)?.toLocaleString();
      const valStr = value.toLocaleString();

      if (isNullOrUndefined(firstVal)) throw new Error('Received empty array.');

      let pads: [string, string];

      switch (align) {
        case StringUtilities.PaddedListAlignment.Left: {
          pads = [valStr, firstVal];
          break;
        }

        case StringUtilities.PaddedListAlignment.Center: {
          pads = [firstVal, firstVal];
          break;
        }

        case StringUtilities.PaddedListAlignment.Right: {
          pads = [valStr, valStr];
          break;
        }

        default: {
          pads = [firstVal, firstVal];
          break;
        }
      }

      const [{ length: startPadLen }, { length: endPadLen }] = pads;
      const formatted = valStr.padStart(startPadLen + 1).padEnd(endPadLen + 2);

      return { formatted, value };
    });
  };

  /**
   * Retrieves random length of characters from a string.
   * @param string The source string.
   * @param length The length of the string.
   * @returns The randomized string.
   */
  public getRandomStrings = (string: string, length: number): string => {
    if (isNullOrUndefined(string)) throw new TypeError('Missing string.');
    if (Number.isNaN(length) || length < 1 || length > string.length) throw new RangeError('Invalid length.');

    return Array(length)
      .fill(null)
      .map(() => string.at(Math.floor(Math.random() * string.length)))
      .join('');
  };
}

export namespace StringUtilities {
  export const Name = 'string' as const;
  export const enum PaddedListAlignment {
    Left = 1,
    Center = 2,
    Right = 3
  }

  export interface PaddedListItem {
    formatted: string;
    value: number;
  }
}

declare module '@sapphire/plugin-utilities-store' {
  interface Utilities {
    [StringUtilities.Name]: Omit<StringUtilities, keyof Utility>;
  }
}
