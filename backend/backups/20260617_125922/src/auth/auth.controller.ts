import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';

class RefreshDto {
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto): Promise<{ accessToken: string; refreshToken: string }> {
    return this.refreshTokenService.rotate(dto.refreshToken);
  }
}
