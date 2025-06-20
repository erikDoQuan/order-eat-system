import { applyDecorators, HttpCode, HttpStatus, SetMetadata, UseInterceptors } from '@nestjs/common';

import { PaginatedResponseInterceptor } from '~/common/interceptors/paginated-response.interceptor';

export const PaginatedResponse = <T>(params: { message: string; status?: HttpStatus }) => {
  return applyDecorators(
    HttpCode(params.status || HttpStatus.OK),
    UseInterceptors(PaginatedResponseInterceptor<T>),
    SetMetadata('RESPONSE_MESSAGE_META_KEY', params.message),
  );
};
