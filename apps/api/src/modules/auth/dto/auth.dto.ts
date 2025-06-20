import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'comehere.thang@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'User123@' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.<>\\/?])(?=.*[0-9]).{8,255}$/, {
    message: 'password should contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @Length(8, 255, { message: 'password has to be at between 8 and 255 characters' })
  password: string;
}
