import { applyDecorators, HttpCode, HttpStatus, SetMetadata, UseInterceptors } from '@nestjs/common';

import { ResponseInterceptor } from '~/common/interceptors/response.interceptor';
import { RESPONSE_MESSAGE_META_KEY, RESPONSE_SERIALIZATION_META_KEY } from '../constants/response.constant';
import { ResponsePagingInterceptor } from '../interceptors/response-paging.interceptor';
import { ResponseSingleInterceptor } from '../interceptors/response-single.interceptor';
import { IResponseOptions, IResponsePagingOptions } from '../interfaces/response-format.interface';

export const Response = <T>(params: { status?: HttpStatus; message: string }) => {
  return applyDecorators(
    HttpCode(params.status || HttpStatus.OK),
    UseInterceptors(ResponseInterceptor<T>),
    SetMetadata('RESPONSE_MESSAGE_META_KEY', params.message),
  );
};

export function ResponsePaging<T>(message: string, options?: IResponsePagingOptions<T>): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor<T>),
    SetMetadata(RESPONSE_MESSAGE_META_KEY, message),
    SetMetadata(RESPONSE_SERIALIZATION_META_KEY, options ? options.classSerialization : undefined),
  );
}

export function ResponseSingle<T>(message: string, options?: IResponseOptions<T>): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponseSingleInterceptor<T>),
    SetMetadata(RESPONSE_MESSAGE_META_KEY, message),
    SetMetadata(RESPONSE_SERIALIZATION_META_KEY, options ? options.classSerialization : undefined),
  );
}
