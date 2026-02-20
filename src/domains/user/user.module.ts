import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { ProvideRepository } from '../../decorators/database.decorator';

@Module({
  controllers: [UserController],
  providers: [UserService, ...ProvideRepository(UserEntity)],
  exports: [UserService],
})
export class UserModule {}
