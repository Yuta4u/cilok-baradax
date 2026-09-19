import { Body, Controller, Post } from '@nestjs/common';
import { ExcelService } from './excel.service';
import { XLSXHeader } from './excel.decorators';

@Controller({
  path: '/excel',
})
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @XLSXHeader('generated')
  @Post()
  async generateExcel(
    @Body() body: Parameters<ExcelService['generateExcel']>[0],
  ) {
    const buffer = await this.excelService.generateExcel(body);
    return buffer;
  }
}
