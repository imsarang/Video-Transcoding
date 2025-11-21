import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request, Response } from "express";
import { Logger } from "nestjs-pino";
import { first, firstValueFrom } from "rxjs";
import { LoginDto } from "src/dto/login.dto";

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly logger: Logger,
        private readonly httpService: HttpService,
        private readonly jwtService: JwtService
    ){}

    private url = process.env.AUTH_SERVICE_URL ?? 'http://localhost:3002';

    private async proxyRequest(method: 'get' | 'post', path: string, data?: any) {
        this.logger.log(`Forwarding ${method.toUpperCase()} request to ${path}`)
        const url = `${this.url}${path}`;
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
    async logout (
        @Res() res: Response
    ) {
        // return this.proxyRequest('get', '/logout')
        res.clearCookie('refreshToken',{
            httpOnly: true,
            sameSite: 'strict'
        })
        
    }
    
    @Get("/refresh-access-token")
    async refreshToken(){
        return this.proxyRequest('get', '/refresh-access-token');
    }

    @Get("/verify-refresh-token")
    async verifyRefreshToken(
        @Req() req: Request,
        @Res() res: Response
    ){
        const token = req.cookies.refreshToken
        const decoded = this.jwtService.decode(token, {complete: true})
        const expiry = decoded.payload.exp // sec
        const current = Math.floor(Date.now() / 1000) // sec
        if(current > expiry)
            throw new UnauthorizedException('Refresh Token Expired')
        const secondsLeft = expiry - current;
        this.logger.log(`refresh token seconds left : ${secondsLeft}`)
    }
}