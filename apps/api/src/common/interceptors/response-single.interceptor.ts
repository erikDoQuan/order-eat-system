import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { Response } from 'express';
import { from, map, Observable, switchMap } from 'rxjs';

import { RESPONSE_MESSAGE_META_KEY, RESPONSE_SERIALIZATION_META_KEY } from '../constants/response.constant';
import { ResponseDataSerialization } from '../dtos/response.dto';
import { IResponse } from '../interfaces/response-format.interface';

@Injectable()
export class ResponseSingleInterceptor<T> implements NestInterceptor<T, ResponseDataSerialization<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDataSerialization<T>> {
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

          const resolvedData = responseData instanceof Promise ? await responseData : responseData;
          const response = resolvedData as IResponse;

          if (response) {
            let serialization = response;

            if (classSerialization) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              serialization = plainToInstance(classSerialization, response);
            }

            serialization = serialization && Object.keys(serialization).length > 0 ? serialization : undefined;

            return {
              statusCode,
              message,
              data: serialization,
            } as ResponseDataSerialization<T>;
          }

          return {
            statusCode,
            message,
          } as ResponseDataSerialization<T>;
        }),
        switchMap(promiseResult => from(Promise.resolve(promiseResult))),
      );
    }

    return next.handle();
  }
}
