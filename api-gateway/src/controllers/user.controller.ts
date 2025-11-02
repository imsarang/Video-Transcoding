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

    private url = process.env.USER_SERVICE_URL ?? 'http://localhost:3003';
    private async proxyRequest(method: 'get' | 'post' | 'put' | 'delete', path: string, data?: any, params?: any) {
        // const url = `${process.env.USER_SERVICE_URL}${path}`;
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${this.url}`);
        const url = `${this.url}${path}`;
        try {
            const response = this.httpService.request({
                method,
                url,
                data,
                params,
                validateStatus: status => true, // Don't throw on any status
            });

            const result = await firstValueFrom(response);
            this.logger.log({
                msg: `Proxy response received`,
                status: result.status,
                statusText: result.statusText,
                url: url
            });
            return result.data;
        } catch (error) {
            this.logger.error({
                msg: 'Proxy request failed',
                error: error.message,
                url,
                method,
                data
            });
            throw error;
        }
    }

    @Get('/:id')
    async getUserProfile (
        @Param('id') id: string
    ) {
        return this.proxyRequest('get', `/${id}`);
    }

    @Get('/')
    async getAllUsers () {
        this.logger.log(`Received request to get all users.`);
        return this.proxyRequest('get', '/');
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