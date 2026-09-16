import { Body, Controller, Delete, Get, Headers, Ip, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { AccountPasswordDto, ChangePasswordDto, ForgotPasswordDto, GoogleLoginDto, LoginDto, RefreshDto, RegisterDto, RequestVerificationDto, ResetPasswordDto, UpdateProfileDto, VerifyEmailDto } from './dto/auth.dto';

interface AuthenticatedRequest extends Request { user: { id: string; sessionId: string }; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('register') register(
    @Body() body: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
  ) {
    return this.auth.register(body, { ip, userAgent, origin: origin || referer });
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('google') google(@Body() body: GoogleLoginDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.auth.googleLogin(body, { ip, userAgent });
  }

  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @Post('login') login(@Body() body: LoginDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.auth.login(body.email, body.password, { ip, userAgent });
  }

  @Post('refresh') refresh(@Body() body: RefreshDto, @Ip() ip: string, @Headers('user-agent') userAgent?: string) {
    return this.auth.refresh(body.refreshToken, { ip, userAgent });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout') async logout(@Req() request: AuthenticatedRequest) { await this.auth.logout(request.user.sessionId); return { success: true }; }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all') async logoutAll(@Req() request: AuthenticatedRequest) { await this.auth.logoutAll(request.user.id); return { success: true }; }

  @UseGuards(JwtAuthGuard)
  @Get('me') me(@Req() request: AuthenticatedRequest) { return this.auth.getProfile(request.user.id); }

  @UseGuards(JwtAuthGuard)
  @Patch('me') updateProfile(@Req() request: AuthenticatedRequest, @Body() body: UpdateProfileDto) { return this.auth.updateProfile(request.user.id, body); }

  @Post('verify-email') verifyEmail(
    @Body() body: VerifyEmailDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.auth.verifyEmailWithToken(body, undefined, { ip, userAgent });
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('request-verification') requestVerification(
    @Body() body: RequestVerificationDto,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
  ) {
    return this.auth.requestEmailVerification(body.email, origin || referer);
  }

  @Post('forgot-password') forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Headers('origin') origin?: string,
    @Headers('referer') referer?: string,
  ) {
    return this.auth.requestPasswordReset(body.email, origin || referer);
  }

  @Post('reset-password') resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password') changePassword(@Req() request: AuthenticatedRequest, @Body() body: ChangePasswordDto) { return this.auth.changePassword(request.user.id, body.currentPassword, body.newPassword); }

  @UseGuards(JwtAuthGuard)
  @Get('sessions') sessions(@Req() request: AuthenticatedRequest) { return this.auth.listSessions(request.user.id, request.user.sessionId); }

  /** UC-AUTH-07: Revoke a specific session (not the current one). */
  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId') revokeSession(@Req() request: AuthenticatedRequest, @Param('sessionId') sessionId: string) {
    return this.auth.revokeSession(request.user.id, sessionId, request.user.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/deactivate') deactivate(@Req() request: AuthenticatedRequest, @Body() body: AccountPasswordDto) { return this.auth.deactivate(request.user.id, body.password); }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('reactivate') reactivate(@Body() body: LoginDto) { return this.auth.reactivate(body.email, body.password); }
}
