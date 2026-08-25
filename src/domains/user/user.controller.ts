import { Body, Controller, Get, Patch, Post, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dtos/add-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Permission } from '../../decorators/auth.decorator';
import { startTransaction } from '../../decorators/database.decorator';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/user',
})
export class UserController {
  public constructor(private readonly userService: UserService) {}

  @Get('/all')
  public async getAll() {
    const res = await this.userService.getAllUsers();
    return res;
  }

  @Get('/cabang')
  public async getCabang() {
    const res = await this.userService.getCabang();
    return res;
  }

  @Put('/change-password')
  public async changePassword(
    @Body() payload: { id: string; password: string },
  ) {
    console.log(payload, 'ini payload');

    const res = await startTransaction(
      this.userService,
      'changePasswordTransaction',
      payload,
    );
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

  @Put('/stock-cilok/:id')
  public async updateStockCilok(
    @Param('id') id: string,
    @Body() payload: { quantity: number },
  ) {
    const res = await startTransaction(
      this.userService,
      'updateStockCilokTransaction',
      id,
      payload.quantity,
    );
    return res;
  }
}
