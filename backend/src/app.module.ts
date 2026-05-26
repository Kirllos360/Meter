import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './auth/auth.module';
import { CorrelationMiddleware } from './common/http/correlation.middleware';

@Module({
  imports: [AppConfigModule, DatabaseModule, AuthModule],
  controllers: [AppController],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
