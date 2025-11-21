import { IsString, Min, MinLength } from "class-validator";

export class LoginDto {
    @IsString()
    @MinLength(4)
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}