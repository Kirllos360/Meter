import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../common/database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';
import { PermissionsGuard } from './permissions.guard';
import { AuthController } from './auth.controller';
import { RefreshTokenService } from './refresh-token.service';
import { PasswordPolicyService } from './password-policy.service';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: (() => { const s = config.get<string>('JWT_SECRET'); if (!s) throw new Error('JWT_SECRET environment variable is required'); return s; })(),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRES_IN', '3600'))
        }
      })
    })
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    RefreshTokenService,
    PasswordPolicyService,
  ],
  exports: [
    PassportModule,
    JwtModule,
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
    RefreshTokenService,
    PasswordPolicyService
  ]
})
export class AuthModule {}
