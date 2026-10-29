import { Controller } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('Authorization')
@Controller({
  path: '/cash-flow-overhead',
})
export class CashFlowOverheadController {}
