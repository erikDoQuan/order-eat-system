import { HttpStatus } from '@nestjs/common';
import { ApiParamOptions, ApiQueryOptions } from '@nestjs/swagger';
import { ClassConstructor } from 'class-transformer';

export interface IDocDefaultOptions {
  httpStatus: HttpStatus;
  message: string;
  statusCode: number;
  classSerialization?: ClassConstructor<any>;
}

export interface IDocRequestOptions {
  params?: ApiParamOptions[];
  queries?: ApiQueryOptions[];
}

export interface IDocResponseOptions<T> {
  statusCode?: number;
  httpStatus?: HttpStatus;
  classSerialization?: ClassConstructor<T>;
  message?: string;
}

export interface IDocAuthOptions {
  accessToken?: boolean;
  refreshToken?: boolean;
}

export interface IDocOptions<T> {
  response?: IDocResponseOptions<T>[];
  request?: IDocRequestOptions;
  auth?: IDocAuthOptions;
}

export interface IDocOfOptions {
  message: string;
  statusCode: number;
  classSerialization?: ClassConstructor<any>;
}

export interface IDocPagingResponseOptions<T> {
  statusCode?: number;
  classSerialization?: ClassConstructor<T>;
}
export interface IDocPagingOptions<T> extends Omit<IDocOptions<T>, 'response'> {
  response: IDocPagingResponseOptions<T>;
}
