import { dataSource } from '../config';
import { hash } from 'bcrypt';
import { PERMISSION } from '../../constant';
import { UserEntity } from '../../domains/user/user.entity';

const userRepo = dataSource.getRepository(UserEntity);

export async function userSeed() {
  const user = await userRepo.findOne({ where: { name: 'Admin' } });
  if (user) return user;
  const newUser = await userRepo.save(
    userRepo.create({
      name: 'Admin',
      email: 'admin@mail.com',
      password: await hash('admin123', 10),
      permission: PERMISSION.SUPER_USER,
    }),
  );

  return newUser;
}
