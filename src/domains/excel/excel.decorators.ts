import { Header } from '@nestjs/common';

export function XLSXHeader(name: string): MethodDecorator {
  const header1 = Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  const header2 = Header(
    'Content-Disposition',
    `attachment; filename="${name}.xlsx"`,
  );
  return (...args) => {
    header1(...args);
    header2(...args);
  };
}
