import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type ExcelJs from 'exceljs';
import { ExcelRecordEntity } from './exel.entity';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Workbook } from 'exceljs';
import { numberToLetters } from '../../utility/number-to-letter';
// import { Workbook } from 'exceljs';

@Injectable()
export class ExcelService {
  public constructor(
    @Inject('EXCEL_JS') public readonly excelJs: typeof ExcelJs,
  ) {}

  public async generateExcel(
    sheets: {
      name: string;
      options?: Partial<ExcelJs.AddWorksheetOptions>;
      rows: unknown[];
    }[],
  ) {
    const workbook = new this.excelJs.Workbook();
    for (const sheet of sheets) {
      const worksheet = workbook.addWorksheet(sheet.name, sheet.options);
      worksheet.addRows(sheet.rows);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  public async parseExcel<T>(props: {
    workbook: ExcelJs.Workbook;
    sheetName: string;
    validationClass: new () => T;
  }) {
    const worksheet = props.workbook.worksheets.find(
      (x) => x.name === props.sheetName,
    );
    if (!worksheet)
      throw new NotFoundException(
        `Worksheet with name '${props.sheetName}' not found`,
      );

    const records: ExcelRecordEntity<T>[] = [];
    const validations = <Promise<ValidationError[]>[]>[];
    const colNumToHeaders = {} as Record<string, string>;
    const headersToColNum = {} as Record<string, number>;

    let isHasValidationError = false;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1 && row.getCell(1).value !== props.sheetName)
        throw new NotFoundException(
          `First cell of first row must be '${props.sheetName}'`,
        );
      if (rowNumber === 2) {
        row.eachCell((cell, colNumber) => {
          if (cell.value) {
            const col = colNumber;
            const v = this.toCamel(cell.value + '');
            colNumToHeaders[col + ''] = v;
            headersToColNum[v] = col;
          }
        });
      }
      if (rowNumber < 3) return;
      const record = {} as Record<string, unknown>;
      row.eachCell((cell, colNumber) => {
        let v = cell.value;
        if (
          typeof cell.value !== 'string' &&
          typeof cell.value !== 'number' &&
          typeof cell.value !== 'boolean' &&
          !(cell.value instanceof Date) &&
          cell.value !== undefined &&
          cell.value !== null
        )
          v = cell.text;
        record[colNumToHeaders[colNumber + '']!] = v;
      });
      const dto = plainToInstance(props.validationClass, record);
      const exrec = new ExcelRecordEntity(
        worksheet,
        dto,
        headersToColNum as never,
        rowNumber,
      );
      const vali = validate(dto as never).then((value) => {
        if (value.length < 1) return [];
        isHasValidationError = true;
        for (const v of value) {
          exrec.setError(
            v.property as never,
            Object.values(v.constraints as never).join('\n'),
          );
        }
        return [];
      });
      validations.push(vali);
      records.push(exrec);
    });
    await Promise.all(validations);

    return {
      isHasValidationError,
      records,
    };
  }

  public async listOfferExcelToJson(buffer: Buffer) {
    const workbook = new this.excelJs.Workbook();
    await workbook.xlsx.load(buffer as never);

    const rows: any[] = [];

    const worksheet = workbook.worksheets[0]; // sheet pertama
    const [, customer, up, cc, termsOfPayment, deliveryTerm, stock]: any =
      worksheet?.getRow(2).values;

    const offer = {
      customer,
      up,
      cc,
      termsOfPayment,
      deliveryTerm,
      stock,
    };

    worksheet?.eachRow((row, rowNumber) => {
      const rowData = row.values;
      if (rowNumber < 5) return;
      const [
        ,
        productBarcode,
        productGroup,
        productName,
        productBrand,
        productType,
        productVariant,
        unit,
        quantity,
        price,
        moq,
        moqPrice,
      ] = rowData as unknown as Array<string | number>;

      rows.push({
        productBarcode,
        productGroup,
        productName,
        productBrand,
        productType,
        productVariant,
        unit,
        quantity,
        price,
        moq,
        moqPrice,
      });
    });

    return {
      offer,
      rows,
    };
  }

  public async productPurchaseExcelToJson(buffer: Buffer) {
    const workbook = new this.excelJs.Workbook();
    await workbook.xlsx.load(buffer as never);

    const worksheet = workbook.worksheets[0]; // sheet pertama
    const rows: any[] = [];

    const [, supplier, noOffer, salesPerson, termsOfPayment, currency]: any =
      worksheet?.getRow(2).values;
    const po = {
      supplier,
      noOffer,
      salesPerson,
      termsOfPayment,
    };

    worksheet?.eachRow((row, rowNumber) => {
      const rowData = row.values;
      if (rowNumber < 5) return;
      const [
        ,
        productGroup,
        productName,
        productBrand,
        productType,
        productVariant,
        unit,
        quantity,
        price,
        moq,
        moqPrice,
      ] = rowData as unknown as Array<string | number>;

      rows.push({
        productGroup,
        productName,
        productBrand,
        productType,
        productVariant,
        unit,
        quantity,
        price,
        moq,
        moqPrice,
        currency,
      });
    });

    return {
      po,
      rows,
    };
  }

  private toCamel(str: string) {
    return str
      .split(/[^a-zA-Z0-9]/g)
      .map((x, i) => {
        if (i === 0) return x.toLowerCase();
        return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
      })
      .join('');
  }

  public autoFit(columns: Partial<ExcelJs.Column>[], startRow = 1) {
    for (const column of columns) {
      let maxLength = 10;
      column.eachCell?.({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber < startRow) return;
        const cellValue = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, cellValue.length + 2);
      });
      column.width = maxLength;
    }
  }

  public async generateDataExcel(
    data: any[],
    title: string,
    columns: Partial<ExcelJs.Column>[],
    period: { sd: string; ed: string },
    header: string[],
    wsName: string,
    rowContent: (val: any) => any,
  ) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(wsName, {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    const maxLetter = numberToLetters(header.length);

    // Add report header/title FIRST
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { bold: true, size: 16 };
    titleRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A1:${maxLetter}1`);

    const periodRow = worksheet.addRow([
      `Period: ${period.sd || ''} - ${period.ed || ''}`,
    ]);
    periodRow.font = { size: 12 };
    periodRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A2:${maxLetter}2`);

    // Add generated date
    const generatedRow = worksheet.addRow([
      `Generated on: ${new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    ]);
    generatedRow.font = { size: 10, italic: true };
    generatedRow.alignment = { horizontal: 'center' };
    worksheet.mergeCells(`A3:${maxLetter}3`);

    worksheet.addRow([]);

    const headerRow = worksheet.addRow(header);

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF366092' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    worksheet.columns = columns;

    data.forEach((val, index) => {
      const row = worksheet.addRow(rowContent(val));
      if (index % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } },
        };
      });
    });

    worksheet.addRow([]);
    const footerRow = worksheet.addRow([`Total Records: ${data.length}`]);
    footerRow.font = { italic: true, size: 10 };
    footerRow.alignment = { horizontal: 'left' };

    this.autoFit(worksheet.columns, 5);
    worksheet.getCell('A1').value = title;

    if (data.length > 0) {
      worksheet.autoFilter = {
        from: 'A5',
        to: `${maxLetter}${5 + data.length}`,
      };
    }

    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 5 }];

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
