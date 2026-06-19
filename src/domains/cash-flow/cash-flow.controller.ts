import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CashFlowService } from './cash-flow.service';
import { startTransaction } from '../../decorators/database.decorator';
import { AddCashFlowDto } from './dtos/create.dto';
import { IUserReq, UserReq } from '../../decorators/auth.decorator';
import { BaseParams } from '../../database/base.entity';
import { AddReportDto } from './dtos/add-report.dto';
import { ConfirmReportDto } from './dtos/confirmation.dto';

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
  public async getDashboard() {
    const res = await this.cashFlowService.getDashboard();
    return res;
  }

  @Get('/cabang/today')
  public async getCabangToday() {
    const res = await this.cashFlowService.getCabangToday();
    return res;
  }

  @Get('/cabang/today/detail/:id')
  public async getCabangTodayDetail(@Param('id') id: string) {
    const res = await this.cashFlowService.getCabangTodayDetail(id);
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

  // @Get('/:id')
  // public async getById(@Param('id') id: string) {
  //   const res = await this.cashFlowService.getById(id);
  //   return res;
  // }

  // @Get('/view/:id')
  // public async getView(@Param('id') id: string) {
  //   const res = await this.cashFlowService.getView(id);
  //   return res;
  // }

  // @Post()
  // public async add(@Body() payload: AddCashFlowDto) {
  //   const res = await startTransaction(
  //     this.cashFlowService,
  //     'addTransaction',
  //     payload,
  //   );
  //   return res;
  // }

  // @Post('report')
  // public async addReport(@Body() payload: AddReportDto) {
  //   const res = await startTransaction(
  //     this.cashFlowService,
  //     'addReportTransaction',
  //     payload,
  //   );
  //   return res;
  // }

  // @Put('/confirm')
  // public async confirmReport(@Body() payload: ConfirmReportDto) {
  //   const res = await startTransaction(
  //     this.cashFlowService,
  //     'confirmReportTransaction',
  //     payload,
  //   );
  //   return res;
  // }
}
