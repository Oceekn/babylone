import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CategoryUsage } from './entities/category-usage.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    @InjectRepository(CategoryUsage)
    private categoryUsageRepository: Repository<CategoryUsage>,
  ) {}

  async create(serviceData: Partial<Service>): Promise<Service> {
    const dataWithDefaults = {
      ...serviceData,
      is_active: serviceData.is_active !== undefined ? serviceData.is_active : true,
    };
    const service = this.servicesRepository.create(dataWithDefaults);
    const saved = await this.servicesRepository.save(service);
    if (saved.category?.trim()) {
      await this.recordCategoryUsage(saved.category.trim());
    }
    return saved;
  }

  async findById(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
      relations: ['professional', 'professional.user'],
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async findByProfessionalId(professionalId: string, activeOnly: boolean = true): Promise<Service[]> {
    const where: any = { professional_id: professionalId };
    if (activeOnly) {
      where.is_active = true;
    }
    return this.servicesRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  /** Tous les services actifs (pour affichage côté client), avec infos professionnel. Optionnel: filtre par mot-clé (titre, description, profession, business_name). */
  async findAllActive(limit: number = 50, query?: string): Promise<Service[]> {
    if (!query || query.trim() === '') {
      return this.servicesRepository.find({
        where: { is_active: true },
        relations: ['professional', 'professional.user'],
        order: { created_at: 'DESC' },
        take: limit,
      });
    }
    const q = `%${query.trim()}%`;
    const qb = this.servicesRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.professional', 'professional')
      .leftJoinAndSelect('professional.user', 'proUser')
      .where('service.is_active = :isActive', { isActive: true })
      .andWhere(
        '(service.title ILIKE :q OR service.description ILIKE :q OR service.category ILIKE :q OR professional.profession ILIKE :q OR professional.business_name ILIKE :q OR proUser.first_name ILIKE :q OR proUser.last_name ILIKE :q)',
        { q },
      )
      .orderBy('service.created_at', 'DESC')
      .take(limit);
    return qb.getMany();
  }

  async update(id: string, updateData: Partial<Service>): Promise<Service> {
    const service = await this.findById(id);
    Object.assign(service, updateData);
    const saved = await this.servicesRepository.save(service);
    if (saved.category?.trim()) {
      await this.recordCategoryUsage(saved.category.trim());
    }
    return saved;
  }

  async delete(id: string): Promise<void> {
    const service = await this.findById(id);
    await this.servicesRepository.remove(service);
  }

  /** Enregistre ou incrémente l'usage d'une catégorie (création service ou recherche). */
  async recordCategoryUsage(name: string): Promise<void> {
    const normalized = name.trim().toLowerCase();
    if (!normalized) return;
    const existing = await this.categoryUsageRepository.findOne({ where: { name: normalized } });
    if (existing) {
      await this.categoryUsageRepository.update({ name: normalized }, { count: existing.count + 1 });
    } else {
      await this.categoryUsageRepository.insert({ name: normalized, count: 1 });
    }
  }

  /** Top 7 catégories les plus utilisées. Retourne les catégories par défaut si aucune n'existe encore. */
  async getTopCategories(limit: number = 7): Promise<{ name: string; count: number }[]> {
    const rows = await this.categoryUsageRepository.find({
      order: { count: 'DESC' },
      take: limit,
    });
    
    // Si aucune catégorie n'existe, initialiser les catégories par défaut
    if (rows.length === 0) {
      const defaultCategories = [
        'maison',
        'beauté',
        'éducation',
        'événements',
        'santé',
        'transport',
        'plomberie',
      ];
      // Initialiser les catégories par défaut dans la base
      for (const catName of defaultCategories) {
        const existing = await this.categoryUsageRepository.findOne({ where: { name: catName } });
        if (!existing) {
          await this.categoryUsageRepository.insert({ name: catName, count: 0 });
        }
      }
      // Recharger après insertion
      const defaultRows = await this.categoryUsageRepository.find({
        order: { count: 'DESC' },
        take: limit,
      });
      return defaultRows.map((r) => ({ name: r.name, count: r.count }));
    }
    
    return rows.map((r) => ({ name: r.name, count: r.count }));
  }
}

