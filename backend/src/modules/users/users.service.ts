import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AccountStatus } from './entities/user.entity';
import { UserContactPhone } from './entities/user-contact-phone.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserContactPhone)
    private contactPhonesRepository: Repository<UserContactPhone>,
  ) {}

  /** Normalise vers E.164 (+237...) pour le Cameroun par défaut */
  normalizePhoneE164(raw: string): string | null {
    if (!raw || typeof raw !== 'string') return null;
    let s = raw.trim().replace(/[\s\-.]/g, '');
    if (!s) return null;
    if (s.startsWith('+')) return s.length >= 10 ? s : null;
    if (s.startsWith('00')) s = '+' + s.slice(2);
    if (s.startsWith('237')) return '+' + s;
    if (/^\d{9}$/.test(s)) return '+237' + s;
    if (/^6\d{8}$/.test(s)) return '+237' + s;
    if (/^0\d{9}$/.test(s)) return '+237' + s.replace(/^0/, '');
    return s.startsWith('+') ? s : null;
  }

  /** Le numéro Babylone du destinataire est-il dans le répertoire importé par l’initiateur ? */
  async hasContactPhoneForUser(initiatorUserId: string, recipientTelephone: string): Promise<boolean> {
    const norm = this.normalizePhoneE164(recipientTelephone);
    if (!norm) return false;
    const row = await this.contactPhonesRepository.findOne({
      where: { user_id: initiatorUserId, phone_e164: norm },
    });
    return !!row;
  }

  /** Remplace les contacts importés par l’utilisateur (répertoire téléphone). */
  async syncContactPhones(userId: string, rawPhones: string[]): Promise<{ saved: number }> {
    const set = new Set<string>();
    for (const raw of rawPhones || []) {
      const n = this.normalizePhoneE164(String(raw));
      if (n) set.add(n);
    }
    await this.contactPhonesRepository.delete({ user_id: userId });
    const phones = [...set].slice(0, 5000);
    if (phones.length === 0) return { saved: 0 };
    await this.contactPhonesRepository.insert(
      phones.map((phone_e164) => ({ user_id: userId, phone_e164 })),
    );
    return { saved: phones.length };
  }

  async create(userData: Partial<User>): Promise<User> {
    // Si password est fourni au lieu de password_hash, le hasher
    if ((userData as any).password && !userData.password_hash) {
      userData.password_hash = await bcrypt.hash((userData as any).password, 10);
      delete (userData as any).password; // Supprimer password pour éviter de l'enregistrer en clair
    }
    
    // Vérifier que password_hash est présent (requis par l'entité)
    if (!userData.password_hash) {
      throw new Error('Password is required');
    }
    
    // Si password_hash est déjà fourni, on le garde tel quel (supposé déjà hashé)
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findByTelephone(telephone: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { telephone } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Réponse API sans mot de passe */
  toSafeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash: _password, ...safe } = user;
    return safe;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt.hash(updateData.password_hash, 10);
    }
    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  // Rechercher des utilisateurs par nom, prenom, telephone ou email
  async searchUsers(query: string, excludeUserId: string): Promise<Partial<User>[]> {
    const searchPattern = `%${query}%`;
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.first_name', 'user.last_name', 'user.telephone', 'user.email', 'user.avatar_url'])
      .where('user.id != :excludeUserId', { excludeUserId });
    
    // Construire la condition de recherche avec gestion des NULL
    qb.andWhere(
      `(
        (user.first_name IS NOT NULL AND LOWER(user.first_name) LIKE LOWER(:q)) OR
        (user.last_name IS NOT NULL AND LOWER(user.last_name) LIKE LOWER(:q)) OR
        (user.telephone IS NOT NULL AND user.telephone LIKE :q) OR
        (user.email IS NOT NULL AND LOWER(user.email) LIKE LOWER(:q))
      )`,
      { q: searchPattern }
    );
    
    const results = await qb.limit(20).getMany();
    return results;
  }
}

