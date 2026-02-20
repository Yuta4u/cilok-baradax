import { Provider } from '@nestjs/common';
import { dataSource } from './config';
import { DataSource } from 'typeorm';
import { REPOSITORY } from '../constant';

export const databaseProviders: Provider[] = [
  {
    provide: REPOSITORY._DATA_SOURCE,
    useFactory: async () => dataSource.initialize(),
  },
  {
    provide: DataSource,
    useExisting: REPOSITORY._DATA_SOURCE,
  },
];
