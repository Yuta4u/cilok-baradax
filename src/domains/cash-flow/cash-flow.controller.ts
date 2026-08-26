import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CashFlowService } from './cash-flow.service';
import { startTransaction } from '../../decorators/database.decorator';
import { AddCashFlowDto } from './dtos/create.dto';
import { IUserReq, UserReq } from '../../decorators/auth.decorator';
import { BaseParams } from '../../database/base.entity';
import { SubmitCashFlowDto } from './dtos/submit-cashflow.dto';

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

  @Get('/dashboard')
  public async getDashboard(@UserReq() { sub }: IUserReq) {
    const res = await this.cashFlowService.getDashboard(sub);
    return res;
  }

  @Get('/history')
  public async getHistory(@UserReq() { sub }: IUserReq) {
    const res = await this.cashFlowService.getHistory(sub);
    return res;
  }

  @Get('/cabang/today')
  public async getCabangToday() {
    const res = await this.cashFlowService.getCabangToday();
    return res;
  }

  @Post()
  public async addCashFlow(@Body() payload: AddCashFlowDto) {
    const res = await startTransaction(
      this.cashFlowService,
      'addCashFlowTransaction',
      payload,
    );
    return res;
  }

  @Put('/submit')
  public async submitCashFlow(@Body() payload: SubmitCashFlowDto) {
    const res = await startTransaction(
      this.cashFlowService,
      'submitCashFlowTransaction',
      payload,
    );
    return res;
  }

  @Put('/approval')
  public async approvalCashFlow(@Body() payload: SubmitCashFlowDto) {
    const res = await startTransaction(
      this.cashFlowService,
      'approvalCashFlowTransaction',
      payload,
    );
    return res;
  }
}
