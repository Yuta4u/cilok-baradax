import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike } from 'typeorm';
import { UserEntity } from './user.entity';
import bcrypt from 'bcrypt';
import { CreateUserRequestDto } from './dtos/add-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Transactional } from '../../decorators/database.decorator';
import { PERMISSION } from '../../constant';

@Injectable()
export class UserService {
  public constructor(private readonly dataSource: DataSource) {}

  public async getCabang() {
    const userRepo = this.dataSource.getRepository(UserEntity);

    const result = await userRepo.find({
      where: {
        permission: 4,
      },
    });

    return result;
  }

  // $$
  @Transactional('dataSource')
  public async createTransaction(
    manager: EntityManager,
    payload: CreateUserRequestDto,
  ) {
    const userRepo = manager.getRepository(UserEntity);
    const findUser = await userRepo.findOne({
      where: [{ email: payload.email }, { name: payload.name }],
    });

    if (findUser) {
      throw new BadRequestException(
        'User with this email or name already exists',
      );
    }

    payload.password = await bcrypt.hash(payload.password, 10);
    const user = userRepo.create({
      ...payload,
      permission: this.aggPermission(payload.permission),
    });
    return userRepo.save(user);
  }

  @Transactional('dataSource')
  public async setActiveTransaction(
    manager: EntityManager,
    id: string,
    active: number,
  ) {
    const userRepo = manager.getRepository(UserEntity);

    if (active) {
      await userRepo.recover({ id });
    } else {
      await userRepo.softDelete({ id });
    }
    return {
      message: 'Successfully! update user',
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async changePasswordTransaction(
    manager: EntityManager,
    payload: { id: string; password: string },
  ) {
    const userRepo = manager.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: payload.id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = await bcrypt.hash(payload.password, 10);
    return userRepo.save(user);
  }

  public async update({ id, ...userUpdateDto }: UpdateUserDto) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    if (userUpdateDto.password)
      userUpdateDto.password = await bcrypt.hash(userUpdateDto.password, 10);
    const user = await userRepo.update(
      { id },
      {
        ...userUpdateDto,
        permission: userUpdateDto.permission
          ? this.aggPermission(userUpdateDto.permission)
          : undefined,
      },
    );
    return user;
  }

  private aggPermission(permissions: (keyof typeof PERMISSION)[]) {
    return permissions.reduce((a, b) => a | PERMISSION[b], 0);
  }

  public async readByEmail(email: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { email } });
    return user;
  }

  public async findOne(id: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    return userRepo.findOne({
      where: {
        id,
      },
    });
  }

  // $$
  public async getAllUsers() {
    const userRepo = this.dataSource.getRepository(UserEntity);

    const result = await userRepo.find();

    return {
      message: 'Successfully! get all user',
      data: result,
      success: true,
      statusCode: 200,
    };
  }

  @Transactional('dataSource')
  public async updateStockCilokTransaction(
    manager: EntityManager,
    id: string,
    quantity: number,
  ) {
    const userRepo = manager.getRepository(UserEntity);

    if (!quantity) {
      throw new BadRequestException('Quantity is required');
    }

    await userRepo.increment(
      {
        id,
      },
      'stockCilok',
      quantity,
    );

    return {
      message: 'Successfully! update stock cilok user',
      success: true,
      statusCode: 200,
    };
  }
}
