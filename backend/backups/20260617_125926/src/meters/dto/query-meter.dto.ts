import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMeterDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all')
  projectId?: string;

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

  @ApiPropertyOptional({ enum: ['electricity', 'water_main', 'water_child'] })
  @IsOptional()
  @IsEnum(['electricity', 'water_main', 'water_child'] as const)
  meterType?: 'electricity' | 'water_main' | 'water_child';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
