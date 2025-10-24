import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { LoginDto } from './app.dto';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jwtService: JwtService
  ) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  @Post('/')
  async loginUser(
  @Body() loginData: LoginDto,
  @Res() res: Response,
  ) {
    // Implementation to login a user
    const response = await this.appService.loginUser(loginData);
    
    // save cookie in refresh token
    res.cookie('refresh_token', response.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    return {
      user: response.user,
      accessToken: response.accessToken
    }
  }

  @Get('/logout')
  async logout(
    @Res() res: Response
  ){
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  }

  @Get('/refresh-token')
  async refreshAccessToken(
    @Res() res: Response
  ){
    const refreshToken = res.req.cookies['refresh_token'];
    if(!refreshToken){
      throw new Error('No refresh token found');
    }

    const refreshData = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_TOKEN
    });

    const accessToken = this.appService.generateAccessToken({
      email: refreshData.email,
      role: refreshData.role,
      firstname: refreshData.firstname
    });

    return {
      accessToken: accessToken
    }
  }
}
