import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches } from 'class-validator';

export class SearchTripDto {
  @ApiProperty({
    example: 'SYD',
    description: 'Origin IATA code (3 uppercase letters)',
    minLength: 3,
    maxLength: 3,
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'origin must be a 3-letter uppercase IATA code',
  })
  origin: string;

  @ApiProperty({
    example: 'GRU',
    description: 'Destination IATA code (3 uppercase letters)',
    minLength: 3,
    maxLength: 3,
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'origin must be a 3-letter uppercase IATA code',
  })
  destination: string;

  @ApiProperty({
    enum: ['fastest', 'cheapest'],
    example: 'fastest',
    description: 'Sorting strategy to apply',
  })
  @IsIn(['fastest', 'cheapest'])
  sortBy: 'fastest' | 'cheapest';
}
