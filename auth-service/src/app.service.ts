import { Injectable } from '@nestjs/common';
import { LoginDto } from './app.dto';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { compare } from 'bcryptjs';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  // getHello(): string {
  //   return 'Hello World!';
  // }
  constructor(
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) { }

  private userInfo;

  async loginUser(
    loginData: LoginDto
  ) {
    // Implementation to login a user
    const { email, password } = loginData;
    const response = this.httpService.get(`${process.env.USER_SERVICE_URL}/${email}`)
    const user = await lastValueFrom(response)

    console.log('user data:', user);

    if (!user) {
      throw new Error('User not found');
    }

    // validate password
    const passwordValid = await compare(password, user.data.password);

    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    // generate JWT token
    this.userInfo = user.data

    const payload = {
      email: this.userInfo.email,
      role: this.userInfo.role,
      firstname: this.userInfo.firstname
    };

    const accessToken = this.generateAccessToken(payload);
    // payload.lastname = this.userInfo.lastname;
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken
    };
  }

  generateAccessToken(payload: any) {

    // ensure values have a concrete type and provide sensible defaults
    const options: any = {
      expiresIn: process.env.JWT_ACCESS_EXPIRE ?? '15m',
      secret: process.env.JWT_ACCESS_TOKEN ?? ''
    };

    return this.jwtService.sign(payload, options);
  }

  generateRefreshToken(payload: any) {

    const options: any = {
      expiresIn: process.env.JWT_REFRESH_EXPIRE ?? '7d',
      secret: process.env.JWT_REFRESH_TOKEN ?? ''
    };

    return this.jwtService.sign(payload, options);
  }

  // async resetAccessToken(refreshToken: string){

  // }
}
