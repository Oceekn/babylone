import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // Si c'est déjà une exception HTTP, la relancer
      if (error.status) {
        throw error;
      }
      // Sinon, logger l'erreur et renvoyer une erreur 500 avec le message
      console.error('Erreur lors de l\'inscription:', error);
      throw new InternalServerErrorException(
        error.message || 'Erreur lors de l\'inscription',
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @Post('send-signup-code')
  @HttpCode(HttpStatus.OK)
  async sendSignupCode(
    @Body() body: { method: 'SMS' | 'Email'; telephone: string; email?: string },
  ) {
    if (!body.method || !body.telephone) {
      throw new BadRequestException('La methode et le numero de telephone sont requis');
    }
    if (body.method === 'Email' && !body.email) {
      throw new BadRequestException('L\'email est requis pour l\'envoi par email');
    }
    return this.authService.sendSignupCode(body.method, body.telephone, body.email);
  }

  @Post('request-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() body: { identifier: string }) {
    if (!body.identifier) {
      throw new BadRequestException('Le numero de telephone ou l\'email est requis');
    }
    return this.authService.requestPasswordReset(body.identifier);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: { reset_token: string; code: string; new_password: string },
  ) {
    if (!body.reset_token || !body.code || !body.new_password) {
      throw new BadRequestException('Tous les champs sont requis');
    }
    if (body.new_password.length < 6) {
      throw new BadRequestException('Le mot de passe doit contenir au moins 6 caracteres');
    }
    return this.authService.resetPassword(body.reset_token, body.code, body.new_password);
  }
}

