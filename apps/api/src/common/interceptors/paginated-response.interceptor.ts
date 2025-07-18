import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PaginationResponseDto } from '~/common/dtos/pagination-response.dto';
import { IResponseFormat } from '../interfaces/response-format.interface';

@Injectable()
export class PaginatedResponseInterceptor<T> implements NestInterceptor<IResponseFormat<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<PaginationResponseDto<T>> {
    if (context.getType() === 'http') {
      const ctx = context.switchToHttp();
      const response: Response = ctx.getResponse();
      // @ts-expect-error
      const statusCode = response.statusCode;
      const message = this.reflector.get<string>('RESPONSE_MESSAGE_META_KEY', context.getHandler());

      return next.handle().pipe(
        map((data: PaginationResponseDto<T>) => {
          return {
            statusCode,
            message,
            data: data.data,
            meta: data.meta,
          };
        }),
      );
    }

    return next.handle();
  }
}
