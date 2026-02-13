import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole, AccountStatus } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  telephone: string;
  role: string;
  pays_code: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<User | null> {
    // Chercher par telephone ou par email
    let user = await this.usersService.findByTelephone(identifier);
    if (!user && identifier.includes('@')) {
      user = await this.usersService.findByEmail(identifier);
    }
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.usersService.verifyPassword(user, password);
    if (!isPasswordValid) {
      return null;
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
  }) {
    try {
      this.logger.log(`Tentative d'inscription pour: ${userData.telephone}`);
      
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

