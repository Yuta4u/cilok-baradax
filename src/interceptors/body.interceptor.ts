import { Multipart, MultipartFile } from '@fastify/multipart';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';

export class BodyInterceptor implements NestInterceptor {
  public async intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest() as FastifyRequest;
    if (request.isMultipart()) await this.handleMultipart(request);
    return next.handle();
  }

  private async handleMultipart(request: FastifyRequest) {
    const body = request.body as Record<string, Multipart>;
    for (const key in body) {
      const value = body[key]!;
      if (value.type === 'field') {
        body[key] = value.value as never;
        continue;
      }

      const file = new FilePiece();
      for (const key2 in file) Reflect.set(file, key2, value[key2 as never]);
      file.toBufffer = () => value.toBuffer();
      Reflect.set(body, key, file);
    }
    request.body = body;
  }
}

export class FilePiece {
  public toBufffer!: () => Promise<Buffer>;
  public file!: MultipartFile['file'];
  public filename!: string;
  public encoding!: string;
  public mimetype!: string;
}
