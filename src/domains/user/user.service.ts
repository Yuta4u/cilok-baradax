import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager, ILike, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import bcrypt from 'bcrypt';
import { CreateUserRequestDto } from './dtos/add-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import {
  InjectRepository,
  Transactional,
} from '@/decorators/database.decorator';
import { PERMISSION } from '@/constant';

@Injectable()
export class UserService {
  public constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
  public async create(payload: CreateUserRequestDto) {
    const findUser = await this.userRepository.findOne({
      where: [{ email: payload.email }, { name: payload.name }],
    });

    if (findUser) {
      throw new BadRequestException(
        'User with this email or name already exists',
      );
    }

    payload.password = await bcrypt.hash(payload.password, 10);
    const user = this.userRepository.create({
      ...payload,
      permission: this.aggPermission(payload.permission),
    });
    return this.userRepository.save(user);
  }

  public read() {
    return this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async update({ id, ...userUpdateDto }: UpdateUserDto) {
    if (userUpdateDto.password)
      userUpdateDto.password = await bcrypt.hash(userUpdateDto.password, 10);
    const user = await this.userRepository.update(
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

  @Transactional('dataSource')
  public async addUserTransaction(
    manager: EntityManager,
    payload: CreateUserRequestDto,
  ) {
    const user = await this.create(payload);
    return user;
  }

  public async delete(id: string) {
    await this.userRepository.softDelete({ id });
  }

  private aggPermission(permissions: (keyof typeof PERMISSION)[]) {
    return permissions.reduce((a, b) => a | PERMISSION[b], 0);
  }

  public async readByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  public async findOne(id: string) {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async find(_: string | undefined, query: string) {
    const results = await this.userRepository.find({
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
}
