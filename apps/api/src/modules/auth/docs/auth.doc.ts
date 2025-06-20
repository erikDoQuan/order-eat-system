import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithCredentialsDoc {
  @ApiProperty({ enum: HttpStatus, example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ type: String, example: 'Login successfully' })
  message: string;

  @ApiProperty({
    example: {
      user: {
        id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        email: 'ammodesk@gmail.com',
        firstName: 'My Name',
        lastName: 'My Last Name',
      },
      accessToken: '<TOKEN>',
    },
  })
  data: unknown;
}

export class SignOutDoc {
  @ApiProperty({ enum: HttpStatus, example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ type: String, example: 'Logout successfully' })
  message: string;

  @ApiProperty({
    example: {
      status: 'success',
    },
  })
  data: unknown;
}

export class ResetPasswordDoc {
  @ApiProperty({ enum: HttpStatus, example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ type: String, example: 'Reset password successfully' })
  message: string;

  @ApiProperty({
    example: {
      code: '12345',
    },
  })
  data: unknown;
}

export class VerifyResetPasswordDoc {
  @ApiProperty({ enum: HttpStatus, example: HttpStatus.OK })
  statusCode: HttpStatus;

  @ApiProperty({ type: String, example: 'Verify reset password successfully' })
  message: string;

  @ApiProperty({
    example: {
      status: 'success',
    },
  })
  data: unknown;
}
