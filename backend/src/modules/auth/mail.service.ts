import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port ? Number(port) : 587,
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log('Mail service initialized with SMTP');
    } else {
      this.logger.warn(
        'SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Set them in .env to send verification emails.',
      );
    }
  }

  isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    if (!this.transporter) {
      throw new Error(
        'Envoi d\'email non configuré. Définissez SMTP_HOST, SMTP_USER et SMTP_PASS dans le fichier .env.',
      );
    }

    const from =
      this.configService.get<string>('MAIL_FROM') ||
      this.configService.get<string>('SMTP_USER') ||
      'noreply@babylone.com';

    const html = `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Vérification de votre inscription</h2>
        <p>Bonjour,</p>
        <p>Votre code de vérification Babylone est :</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #87CEEB;">${code}</p>
        <p>Ce code expire dans 10 minutes. Ne le partagez avec personne.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: `Babylone <${from}>`,
      to,
      subject: 'Votre code de vérification Babylone',
      text: `Votre code de vérification Babylone : ${code}. Expire dans 10 minutes.`,
      html,
    });

    this.logger.log(`Verification email sent to ${to}`);
  }
}
