import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FilePiece } from '../../../interceptors/body.interceptor';
import { IsFile, MimeType } from '../../../decorators/file.decorator';

export class ParseExcelDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsFile()
  @MimeType([
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ])
  public file!: FilePiece;
}
