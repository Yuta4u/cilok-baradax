import { Worksheet } from 'exceljs';

export class ExcelRecordEntity<T> {
  public constructor(
    private sheet: Worksheet,
    public data: T,
    public cellRef: Record<keyof T, number>,
    public row: number,
  ) {}

  public setError(key: keyof T, message: string) {
    const cell = this.sheet.getRow(this.row).getCell(this.cellRef[key]);
    cell.style = {
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0000' },
        bgColor: { argb: 'FF0000' },
      },
    };

    cell.note = message;
  }
}
