import { FilePiece } from '../interceptors/body.interceptor';
import {
  Validate,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

export function IsFile(options?: ValidatorOptions) {
  return Validate(CustomFileValidator, options);
}

type Mime =
  // Text
  | 'text/plain'
  | 'text/html'
  | 'text/css'
  | 'text/javascript'
  | 'text/csv'
  | 'text/xml'
  | 'text/markdown'

  // Image
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/x-icon'

  // Audio
  | 'audio/mpeg'
  | 'audio/wav'
  | 'audio/ogg'
  | 'audio/webm'
  | 'audio/aac'
  | 'audio/flac'
  | 'audio/mp4'

  // Video
  | 'video/mp4'
  | 'video/mpeg'
  | 'video/webm'
  | 'video/ogg'
  | 'video/x-msvideo'
  | 'video/quicktime'

  // Application
  | 'application/json'
  | 'application/xml'
  | 'application/ld+json'
  | 'application/pdf'
  | 'application/zip'
  | 'application/gzip'
  | 'application/x-tar'
  | 'application/x-www-form-urlencoded'
  | 'application/javascript'
  | 'application/octet-stream'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'application/vnd.ms-powerpoint'
  | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/x-shockwave-flash'

  // Font
  | 'font/otf'
  | 'font/ttf'
  | 'font/woff'
  | 'font/woff2'

  // Multipart
  | 'multipart/form-data'
  | 'multipart/byteranges';

export function MimeType(
  options: Mime[],
  validationOptions?: ValidatorOptions,
) {
  return Validate(CustomMimeValidator, options, validationOptions);
}

class CustomMimeValidator implements ValidatorConstraintInterface {
  defaultMessage(validationArguments: ValidationArguments): string {
    const constraints = validationArguments!.constraints;
    return `File mime type must be one of ${constraints.join(', ')}`;
  }

  validate(value: unknown, validationArguments?: ValidationArguments): boolean {
    if (value instanceof FilePiece) {
      return validationArguments!.constraints.includes(value.mimetype);
    }
    return false;
  }
}
class CustomFileValidator implements ValidatorConstraintInterface {
  defaultMessage(): string {
    return 'File is required';
  }
  validate(value: unknown): Promise<boolean> | boolean {
    return value instanceof FilePiece;
  }
}
