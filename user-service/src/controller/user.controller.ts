import { Body, Controller, Delete, Get, Post, Put, Res } from "@nestjs/common";
import { Response } from "express";
import { Logger } from "nestjs-pino";
import { CreateUserDto } from "src/dto/entity.dto";
import { UserService } from "src/service/user.service";

@Controller('')
export class UserController {

    constructor (
        private readonly userService: UserService,
        private readonly logger: Logger
    ){}

    @Get('/')
    async getUsers () { 
        this.logger.log(`Received request to get all users.`);
        return await this.userService.getUsers();
    }

    @Post('/')
    async createUser(
         @Body() createUserData: CreateUserDto,
    ) {
        // Implementation to create a new user
        const response = await this.userService.createUser(createUserData);
        return response
    }

    @Get('/email/:email')
    async getUserByEmail(
        @Body('email') email: string,
    ) {
        return await this.userService.getUserByEmail(email);
    }
    @Get('/:id')
    async getUserById(){}

    @Put('/:id')
    async updateUser() { }

    @Delete('/:id')
    async deleteUser() { }

    @Get('/reset-password')
    async resetPassword() { }

    @Get('/forgot-password')
    async forgotPassword() { }
}