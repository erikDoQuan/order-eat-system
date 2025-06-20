import { ClassConstructor } from 'class-transformer';

import { PaginationQueryDto } from '../dtos/response.dto';

export interface IResponseFormat<T> {
  statusCode: number;
  message: string | string[];
  data: T;
  meta?: Record<string, unknown>;
}

export interface IResponseOptions<T> {
  classSerialization?: ClassConstructor<T>;
}

export type IResponsePagingOptions<T> = IResponseOptions<T>;

export interface IResponsePaging<T = Record<string, any>> {
  totalItems: number;
  paginationDto: PaginationQueryDto;
  data: T[];
}

export interface IResponse {
  data?: Record<string, any>;
  statusCode?: number;
  message?: string;
}
