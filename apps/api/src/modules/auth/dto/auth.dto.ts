import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'nguyennhatminhquan@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'MinhQuan-2004!' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?])(?=.*[0-9]).{8,255}$/, {
    message: 'password should contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @Length(8, 255, { message: 'password has to be at between 8 and 255 characters' })
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewPassword-2024!' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  newPassword: string;
}
