import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  UseInterceptors,
  Body,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/passport/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { RoleGuard } from './guards/role.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import { Request, Response } from 'express';
import { User } from './decorators/user.decorator';
import { MailerService } from '@nestjs-modules/mailer';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService,
    private mailerService: MailerService,
  ) {}
  @UseInterceptors(LoggingInterceptor)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(req.user._doc, res);

    return result;
  }

  @Post('auth/logout')
  async logout(
    @Req() req: Request,
    @User() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(user);
    return await this.authService.logout(user, res);
  }

  @Public()
  @Post('auth/register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }
  @Public()
  @Get('auth/refresh-token')
  async refreshToken(@Req() request: Request) {
    console.log(request.cookies);
    return this.authService.refreshToken(request);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('ADMIN') // Chỉ admin được truy cập
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Public()
  @Post('mail')
  async sendMail() {
    try {
      await this.mailerService.sendMail({
        to: 'nbpl1403@gmail.com', // list of receivers

        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome',
        template: 'test',
        context: {
          // ✏️ filling curly brackets with content
          name: 'a',
          activationCode: 1233212,
        },
      });
    } catch (err) {
      console.log(err);
    }

    return 'success';
  }
}
