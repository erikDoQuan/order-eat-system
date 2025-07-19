import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IResponseFormat } from '../interfaces/response-format.interface';

type DataWithMeta = {
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IResponseFormat<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponseFormat<T>> {
    if (context.getType() === 'http') {
      const ctx = context.switchToHttp();
      const response: Response = ctx.getResponse();
      // @ts-expect-error
      const statusCode = response.statusCode;
      const message = this.reflector.get<string>('RESPONSE_MESSAGE_META_KEY', context.getHandler());

      return next.handle().pipe(
        map((data: DataWithMeta) => {
          // Sửa lỗi destructure meta of undefined
          const meta = data && typeof data === 'object' && 'meta' in data ? (data as any).meta : undefined;
          return {
            statusCode,
            message,
            data: data as T,
            meta,
          };
        }),
      );
    }

    return next.handle();
  }
}
