import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('DB_HOST', '127.0.0.1');
    const port = Number(this.configService.get<string>('DB_PORT', '5432'));
    const database = this.configService.get<string>('DB_NAME', 'meter_pulse');
    const user = this.configService.get<string>('DB_USER', 'postgres');
    const password = this.configService.get<string>('DB_PASSWORD', 'postgres');
    const schema = this.configService.get<string>('DB_SCHEMA', 'sim_system');

    this.pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      application_name: 'meter-pulse-backend',
      options: `-c search_path=${schema},public`
    });
  }

  async onModuleInit(): Promise<void> {
    const expectedDatabase = this.configService.get<string>('DB_NAME', 'meter_pulse');
    const expectedSchema = this.configService.get<string>('DB_SCHEMA', 'sim_system');
    const client = await this.pool.connect();
    try {
      const result = await client.query<{
        current_database: string;
        current_schema: string;
      }>('SELECT current_database() AS current_database, current_schema() AS current_schema');

      const row = result.rows[0];
      const dbMatches = row?.current_database === expectedDatabase;
      const schemaMatches = row?.current_schema === expectedSchema;

      if (!dbMatches || !schemaMatches) {
        throw new Error(
          `PostgreSQL target mismatch: expected database=${expectedDatabase}, schema=${expectedSchema}; got database=${row?.current_database}, schema=${row?.current_schema}`
        );
      }

      this.logger.log('PostgreSQL connection validated');
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
