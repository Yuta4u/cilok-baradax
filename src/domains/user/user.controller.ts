import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dtos/add-user.dto';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Permission } from '../../decorators/auth.decorator';
import { startTransaction } from '../../decorators/database.decorator';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/user',
})
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Permission(['SUPER_USER'])
  @Get()
  public async retrieve() {
    const users = await this.userService.read();
    return users;
  }

  @Get('/all')
  public async getAll() {
    const res = await this.userService.getAll();
    return res;
  }

  @Post('/active/:id')
  public async setActive(
    @Param('id') id: string,
    @Body('active') active: number,
  ) {
    const res = await startTransaction(
      this.userService,
      'setActiveTransaction',
      id,
      active,
    );
    return res;
  }

  @Permission(['SUPER_USER'])
  @Post()
  public async create(@Body() payload: CreateUserRequestDto) {
    const res = await startTransaction(
      this.userService,
      'createTransaction',
      payload,
    );
    return res;
  }

  @Permission(['SUPER_USER'])
  @Patch()
  public async update(@Body() userUpdateDto: UpdateUserDto) {
    await this.userService.update(userUpdateDto);
    return 'Successfully! update User';
  }

  @Permission(['SUPER_USER'])
  @Delete(':id')
  @ApiParam({
    name: 'id',
    required: true,
    format: 'uuid',
    description: 'ID of the user to delete',
  })
  public async delete(@Param('id') id: string) {
    await this.userService.delete(id);
    return 'Successfully! delete User';
  }

  @Get('/search')
  public async find(
    @Query('query') query: string,
    @Query('pointer', new ParseUUIDPipe({ optional: true })) pointer?: string,
  ) {
    return this.userService.find(pointer, query);
  }
}
