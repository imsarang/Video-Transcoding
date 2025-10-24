import { HttpService } from "@nestjs/axios";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { firstValueFrom } from "rxjs";
import { CreateDto } from "src/dto/create.dto";

@Controller('/users')
export class UserController {
    constructor(
        private readonly logger: Logger,
        private readonly httpService: HttpService
    ){}

    private async proxyRequest(method: 'get' | 'post' | 'put' | 'delete', path: string, data?: any, params?: any) {
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${path}`)
        const url = `${process.env.USER_SERVICE_URL}${path}`;
        const response = this.httpService.request({
            method,
            url,
            data,
            params,
        })

        return firstValueFrom(response);
    }

    @Get('/:id')
    async getUserProfile (
        @Param('id') id: string
    ) {
        return this.proxyRequest('get', `/${id}`);
    }

    @Post()
    async createUser (
        @Body() createUserData: CreateDto
    ){
        return this.proxyRequest('post', '/', createUserData);
    }

    @Get('/forgot-password')
    async forgotPassword () {
        return this.proxyRequest('get', '/forgot-password');
    }

    @Get('/reset-password')
    async resetPassword () {
        return this.proxyRequest('get', '/reset-password');
    }

    @Put('/:id')
    async updateProfile (
        @Param('id') id: string,
        @Body() updateData: any
    ) {
        return this.proxyRequest('put', `/${id}`, updateData);
    }

    @Delete('/:id')
    async deleteUser (
        @Param('id') id: string
    ) {
        return this.proxyRequest('delete', `/${id}`);
    }
}