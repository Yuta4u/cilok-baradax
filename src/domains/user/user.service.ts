import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import bcrypt from 'bcrypt';
import { CreateUserRequestDto } from './dtos/add-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  InjectRepository,
  Transactional,
} from '../../decorators/database.decorator';
import { PERMISSION } from '../../constant';

@Injectable()
export class UserService {
  public constructor(private readonly dataSource: DataSource) {}

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
    console.log(id, active, 'test');

    if (active) {
      await userRepo.update(
        {
          id,
        },
        {
          deletedAt: new Date(),
        },
      );
    } else {
      await userRepo.update(
        {
          id,
        },
        {
          deletedAt: null,
        },
      );
    }
    return {
      message: 'Successfully! update user',
      success: true,
      statusCode: 200,
    };
  }

  public read() {
    const userRepo = this.dataSource.getRepository(UserEntity);
    return userRepo.find({
      order: {
        createdAt: 'DESC',
      },
    });
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

  public async delete(id: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    await userRepo.softDelete({ id });
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

  public async find(_: string | undefined, query: string) {
    const userRepo = this.dataSource.getRepository(UserEntity);
    const results = await userRepo.find({
      where: {
        name: ILike(`%${query}%`),
      },
      order: {
        id: 'DESC',
      },
      select: {
        name: true,
        id: true,
      },
      take: 20,
    });
    const mapped = {} as Record<string, UserEntity>;
    for (const result of results) {
      mapped[result.id] = result;
    }
    return mapped;
  }

  public async getAll() {
    const userRepo = await this.dataSource
      .getRepository(UserEntity)
      .createQueryBuilder('u')
      .select([
        'u.id as id',
        'u.name as name',
        'u.email as email',
        'u.permission as permission',
        'u.deletedAt IS NULL as active',
      ])
      .withDeleted()
      .getRawMany();

    return {
      message: 'Successfully! get all user',
      data: userRepo,
      success: true,
      statusCode: 200,
    };
  }
}
