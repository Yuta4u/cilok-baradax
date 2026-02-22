// user.seed.ts
import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { UserEntity } from '../../domains/user/user.entity';
import { PERMISSION } from '../../constant';

export async function userSeed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(UserEntity);

  const user = await userRepo.findOne({ where: { name: 'Admin' } });
  console.log('hit');

  if (user) {
    console.log('⏭️  Skipped: Admin already exists');
    return user;
  }

  const newUser = await userRepo.save(
    userRepo.create({
      name: 'Admin',
      email: 'admin@mail.com',
      password: await hash('admin123', 10),
      permission: PERMISSION.SUPER_USER,
    }),
  );

  console.log('✅ Seeded: Admin');
  return newUser;
}
