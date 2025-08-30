import { IsString, IsNumber } from 'class-validator';

/**
 * DTO representing the most popular command formats and their usage count.
 */
export class MostPopularFormatDto {
  /**
   * The format string.
   * @type {string}
   */
  @IsString()
  format: string;

  /**
   * The number of times this format was used.
   * @type {number}
   */
  @IsNumber()
  count: number;
}
