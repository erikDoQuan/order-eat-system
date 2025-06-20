import { HttpException, HttpStatus } from '@nestjs/common';

export type Error = {
  field?: string;
  error: string;
  code?: string;
};

export class ValidationFilterException extends HttpException {
  constructor({ message, errors }: { message: string; errors: Error[] }) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
