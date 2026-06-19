import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/types/role.enum';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly service: SearchService) {}

  @Get()
  @Roles(Role.OPERATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Global search across all entities' })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.service.search(q, limit ? parseInt(limit) : 10);
  }
}
