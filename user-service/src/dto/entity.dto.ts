import { IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class LoginDto {
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}

export class CreateUserDto {
    @IsString()
    @MinLength(4)
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}

// Todo
export class UpdateUserDto {}