import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, AccountStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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

