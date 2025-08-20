import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Length, Min } from 'class-validator';

export class CreateTripDto {
  @ApiProperty()
  @IsString()
  tripId: string;

  @ApiProperty()
  @IsString()
  @Length(3, 3)
  origin: string;

  @ApiProperty()
  @IsString()
  @Length(3, 3)
  destination: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  duration: number;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  displayName: string;
}
