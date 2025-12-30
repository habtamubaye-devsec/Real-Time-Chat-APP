import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'Full Name should not be empty.' })
  @IsString({ message: 'Full Name must be a string.' })
  fullName: string;

  @Field()
  @IsNotEmpty({ message: 'Password should not be empty.' })
  @MinLength(8, {
    message: 'Password is too short. Minimum length is 8 characters.',
  })
  password: string;

  @Field()
  @IsNotEmpty({ message: 'Confirm Password should not be empty.' })
  confirmPassword: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
