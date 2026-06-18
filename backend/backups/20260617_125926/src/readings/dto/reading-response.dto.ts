import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReadingResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  meterId!: string;

  @ApiProperty({
    enum: ['valid', 'pending_review', 'estimated', 'suspicious', 'corrected', 'rejected']
  })
  status!: string;

  @ApiPropertyOptional({ type: 'number' })
  consumptionValue?: number | null;

  @ApiPropertyOptional()
  projectThresholdProfile?: string | null;
}
