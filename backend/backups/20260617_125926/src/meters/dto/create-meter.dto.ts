import { IsString, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMeterDto {
  @ApiProperty()
  @IsString()
  serialNumber!: string;

  @ApiProperty({ enum: ['electricity', 'water_main', 'water_child'] })
  @IsEnum(['electricity', 'water_main', 'water_child'] as const)
  meterType!: 'electricity' | 'water_main' | 'water_child';

  @ApiProperty()
  @IsString()
  brand!: string;

  @ApiProperty()
  @IsString()
  model!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  installationDate!: string;

  @ApiProperty({ format: 'date-time' })
  @IsDateString()
  activationDate!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all')
  projectId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  locationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  parentMainMeterId?: string;
}
