import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

ConfigModule.forRoot();

export const dataSource = new DataSource({
  url: process.env.DATABASE_URL,
  type: 'postgres',
  entities: [__dirname + '/../../**/*.entity.{js,ts}'],
  // migrations: [__dirname + '/../migrations/*.{js,ts}'],
  synchronize: true,
});
