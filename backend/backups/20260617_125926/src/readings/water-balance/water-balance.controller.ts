import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WaterBalanceService } from './water-balance.service';
import { WaterBalanceResponseDto } from './dto/water-balance.dto';

@ApiTags('Readings')
@Controller('projects/:projectId/water-balance')
export class WaterBalanceController {
  constructor(private readonly service: WaterBalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get water balance variance for a project' })
  async getWaterBalance(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('from') from: string,
    @Query('to') to: string
  ): Promise<WaterBalanceResponseDto> {
    return this.service.getWaterBalance(projectId, new Date(from), new Date(to));
  }
}
