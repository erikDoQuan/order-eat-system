import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { from, map, Observable, switchMap } from 'rxjs';

import { RESPONSE_MESSAGE_META_KEY, RESPONSE_SERIALIZATION_META_KEY } from '../constants/response.constant';
import { PaginationMetaDto, ResponsePagingSerialization } from '../dtos/response.dto';
import { IResponsePaging } from '../interfaces/response-format.interface';

@Injectable()
export class ResponsePagingInterceptor<T> implements NestInterceptor<Promise<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponsePagingSerialization> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map(async (responseData: Promise<Record<string, any>> | Record<string, any>) => {
          const ctx: HttpArgumentsHost = context.switchToHttp();
          const responseExpress: Response = ctx.getResponse();

          const message: string = this.reflector.get<string>(RESPONSE_MESSAGE_META_KEY, context.getHandler());

          const classSerialization: ClassConstructor<any> = this.reflector.get<ClassConstructor<any>>(
            RESPONSE_SERIALIZATION_META_KEY,
            context.getHandler(),
          );

          const statusCode: number = responseExpress.statusCode;

          // Ensure responseData is resolved if it's a Promise
          const resolvedData = responseData instanceof Promise ? await responseData : responseData;
          const response = resolvedData as IResponsePaging;

          const { data, totalItems, paginationDto } = response;

          let serialization = data;
          if (classSerialization) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            serialization = plainToInstance(classSerialization, data);
          }

          const pageMetaDto = new PaginationMetaDto({
            totalItems,
            options: paginationDto,
          });

          const responseWithMeta: ResponsePagingSerialization = {
            statusCode,
            message,
            data: serialization,
            meta: pageMetaDto,
          };

          return responseWithMeta;
        }),
        switchMap(promiseResult => from(Promise.resolve(promiseResult))),
      );
    }

    return next.handle();
  }
}
