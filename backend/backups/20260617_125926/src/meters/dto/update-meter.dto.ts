import { IsString, IsUUID, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({ enum: ['electricity', 'water_main', 'water_child'] })
  @IsOptional()
  @IsEnum(['electricity', 'water_main', 'water_child'] as const)
  meterType?: 'electricity' | 'water_main' | 'water_child';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsOptional()
  @IsDateString()
  activationDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  projectId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  locationId?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  parentMainMeterId?: string | null;

  @ApiPropertyOptional({
    enum: [
      'available',
      'assigned',
      'active',
      'offline',
      'faulty',
      'replaced',
      'terminated',
      'retired'
    ]
  })
  @IsOptional()
  @IsEnum([
    'available',
    'assigned',
    'active',
    'offline',
    'faulty',
    'replaced',
    'terminated',
    'retired'
  ] as const)
  status?:
    | 'available'
    | 'assigned'
    | 'active'
    | 'offline'
    | 'faulty'
    | 'replaced'
    | 'terminated'
    | 'retired';
}
