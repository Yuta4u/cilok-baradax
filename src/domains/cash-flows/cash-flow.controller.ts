import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CashFlowService } from './cash-flow.service';
import { startTransaction } from '../../decorators/database.decorator';
import { AddCashFlowDto } from './dtos/create.dto';
import { IUserReq, UserReq } from '../../decorators/auth.decorator';
import { BaseParams } from '../../database/base.entity';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/cash-flow',
})
export class CashFlowController {
  public constructor(private readonly cashFlowService: CashFlowService) {}

  @Get()
  public async getAll(
    @Query() query: BaseParams,
    @UserReq() { sub }: IUserReq,
  ) {
    const res = await this.cashFlowService.getAll(query, sub);
    return res;
  }

  @Post()
  public async add(
    @Body() payload: AddCashFlowDto,
    @UserReq() { sub }: IUserReq,
  ) {
    const res = await startTransaction(
      this.cashFlowService,
      'addTransaction',
      payload,
      sub,
    );
    return res;
  }
}
