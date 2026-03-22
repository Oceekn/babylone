import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from './mail.service';
import { User, UserRole, AccountStatus } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  telephone: string;
  role: string;
  pays_code: string;
}

const CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly signupCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async checkIdentifierExists(identifier: string): Promise<boolean> {
    const raw = (identifier ?? '').trim();
    if (!raw) return false;
    let user = await this.usersService.findByTelephone(raw);
    if (!user && raw.includes('@')) {
      user = await this.usersService.findByEmail(raw);
    }
    return !!user;
  }

  /**
   * Auth login: distinguer "compte introuvable" vs "mauvais mot de passe"
   * pour permettre un UX en 2 étapes côté frontend.
   */
  async validateUser(identifier: string, password: string): Promise<User> {
    const raw = (identifier ?? '').trim();
    // Chercher par telephone ou par email
    let user = await this.usersService.findByTelephone(raw);
    if (!user && raw.includes('@')) {
      user = await this.usersService.findByEmail(raw);
    }
    if (!user) {
      throw new UnauthorizedException('USER_NOT_FOUND');
    }

    const isPasswordValid = await this.usersService.verifyPassword(user, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('BAD_PASSWORD');
    }

    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      telephone: user.telephone,
      role: user.role,
      pays_code: user.pays_code,
    };

    await this.usersService.updateLastLogin(user.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        telephone: user.telephone,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        pays_code: user.pays_code,
        status: user.status,
      },
    };
  }

  async register(userData: {
    telephone: string;
    password: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    pays_code?: string;
    role?: string;
    verification_code?: string;
  }) {
    try {
      this.logger.log(`Tentative d'inscription pour: ${userData.telephone}`);

      // Si l'utilisateur a renseigné un email, le code de vérification est obligatoire
      if (userData.email && userData.email.trim()) {
        if (!userData.verification_code || !userData.verification_code.trim()) {
          throw new UnauthorizedException('Veuillez entrer le code de vérification envoyé à votre email.');
        }
        const key = userData.email.trim().toLowerCase();
        const stored = this.signupCodes.get(key);
        if (!stored) {
          throw new UnauthorizedException('Code de vérification expiré ou non demandé. Cliquez sur "Envoyer le code" puis saisissez le code reçu par email.');
        }
        if (Date.now() > stored.expiresAt) {
          this.signupCodes.delete(key);
          throw new UnauthorizedException('Code de vérification expiré. Demandez un nouveau code.');
        }
        if (stored.code !== userData.verification_code.trim()) {
          throw new UnauthorizedException('Code de vérification incorrect.');
        }
        this.signupCodes.delete(key);
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.usersService.findByTelephone(userData.telephone);
      if (existingUser) {
        // En développement : mettre à jour le profil et connecter
        this.logger.log(`Utilisateur ${userData.telephone} existe déjà — mise à jour et login`);
        // password_hash dans update() est automatiquement re-hashé, donc passer le mot de passe brut
        const updates: any = {
          password_hash: userData.password,
          status: AccountStatus.ACTIVE,
          is_verified: true,
        };
        if (userData.first_name) updates.first_name = userData.first_name;
        if (userData.last_name) updates.last_name = userData.last_name;
        if (userData.email) updates.email = userData.email;
        const updatedUser = await this.usersService.update(existingUser.id, updates);
        return this.login(updatedUser);
      }

      const user = await this.usersService.create({
        ...userData,
        pays_code: userData.pays_code || 'CM',
        role: userData.role ? (userData.role as UserRole) : UserRole.CLIENT,
        status: AccountStatus.ACTIVE, // MVP : activer directement
        is_verified: true,
      });

      this.logger.log(`Utilisateur créé avec succès: ${user.id}`);

      return this.login(user);
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Envoyer un code de vérification pour l'inscription.
   * Email : envoi réel par SMTP. SMS : non implémenté pour l'instant.
   */
  async sendSignupCode(
    method: 'SMS' | 'Email',
    telephone: string,
    email?: string,
  ): Promise<{ message: string }> {
    if (method === 'SMS') {
      throw new BadRequestException(
        'La vérification par SMS n\'est pas encore disponible. Choisissez "Par email".',
      );
    }

    if (!email || !email.includes('@')) {
      throw new BadRequestException('Une adresse email valide est requise pour recevoir le code.');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = email.trim().toLowerCase();
    this.signupCodes.set(key, {
      code,
      expiresAt: Date.now() + CODE_EXPIRY_MS,
    });

    if (this.mailService.isConfigured()) {
      await this.mailService.sendVerificationCode(email.trim(), code);
    } else {
      this.logger.warn(
        `SMTP non configuré — code de vérification pour ${email} (à utiliser dans l'app) : ${code}`,
      );
    }

    return {
      message: 'Un code de vérification a été envoyé à votre adresse email.',
    };
  }

  /**
   * MVP : Demander la reinitialisation du mot de passe.
   * En production, un vrai SMS/email serait envoye.
   * Pour le MVP, on genere un code fixe (123456) et on retourne un token temporaire.
   */
  async requestPasswordReset(identifier: string): Promise<{ message: string; reset_token: string }> {
    // Chercher l'utilisateur par telephone ou email
    let user = await this.usersService.findByTelephone(identifier);
    if (!user && identifier.includes('@')) {
      user = await this.usersService.findByEmail(identifier);
    }
    if (!user) {
      // Ne pas reveler si l'utilisateur existe pour des raisons de securite
      // Mais pour le MVP, on retourne quand meme un message generique
      return {
        message: 'Si un compte existe avec cet identifiant, un code de verification a ete envoye.',
        reset_token: '',
      };
    }

    // Generer un token temporaire pour la reinitialisation
    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password_reset' },
      { expiresIn: '15m' },
    );

    this.logger.log(`Code de reinitialisation pour ${identifier}: 123456 (MVP)`);

    return {
      message: 'Un code de verification a ete envoye.',
      reset_token: resetToken,
    };
  }

  /**
   * MVP : Reinitialiser le mot de passe avec un token et un code de verification.
   * Le code MVP est 123456.
   */
  async resetPassword(resetToken: string, code: string, newPassword: string): Promise<{ message: string; access_token: string; user: any }> {
    // Verifier le code (MVP : accepter 123456)
    if (code !== '123456') {
      throw new UnauthorizedException('Code de verification invalide');
    }

    // Verifier le token
    let payload: any;
    try {
      payload = this.jwtService.verify(resetToken);
    } catch (error) {
      throw new UnauthorizedException('Le lien de reinitialisation a expire. Veuillez recommencer.');
    }

    if (payload.purpose !== 'password_reset') {
      throw new UnauthorizedException('Token invalide');
    }

    // Mettre a jour le mot de passe
    const updatedUser = await this.usersService.update(payload.sub, {
      password_hash: newPassword,
    });

    this.logger.log(`Mot de passe reinitialise pour l'utilisateur ${payload.sub}`);

    // Connecter l'utilisateur automatiquement
    return {
      message: 'Mot de passe reinitialise avec succes',
      ...(await this.login(updatedUser)),
    };
  }
}

