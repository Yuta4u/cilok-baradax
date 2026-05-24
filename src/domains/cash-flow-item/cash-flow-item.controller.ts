import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { startTransaction } from '../../decorators/database.decorator';
import { IUserReq, UserReq } from '../../decorators/auth.decorator';
import { BaseParams } from '../../database/base.entity';
import { CashFlowItemService } from './cash-flow-item.service';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/cash-flow',
})
export class CashFlowItemController {
  public constructor(
    private readonly cashFlowItemService: CashFlowItemService,
  ) {}
}
