import { dataSource } from '../config';
import { userSeed } from './user.seed';

async function seeding() {
  console.time('🚀 Seeding in');
  if (!dataSource.isInitialized) await dataSource.initialize();
  await userSeed(dataSource);
  // await materailSeed();
  await dataSource.destroy();

  console.timeEnd('🚀 Seeding in');
}

void seeding();
