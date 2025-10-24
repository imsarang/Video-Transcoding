import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { Logger } from "nestjs-pino";
import { first, firstValueFrom } from "rxjs";
import { LoginDto } from "src/dto/login.dto";

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly logger: Logger,
        private readonly httpService: HttpService
    ){}

    private async proxyRequest(method: 'get' | 'post', path: string, data?: any) {
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${path}`)
        const url = `${process.env.AUTH_SERVICE_URL}${path}`;
        const response = this.httpService.request({
            method,
            url,
            data,
            withCredentials: true
        })
        return firstValueFrom(response);
    }

    @Post('/login')
    async login (
       @Body() data: LoginDto
    ) {
        return this.proxyRequest('post', '/login', data);
    }   

    @Get('/logout')
    async logout () {
        return this.proxyRequest('get', '/logout')
    }
    
    @Get("/refresh-token")
    async refreshToken(){
        return this.proxyRequest('get', '/refresh-token');
    }
}