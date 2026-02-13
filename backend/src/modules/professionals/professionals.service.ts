import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professional } from './entities/professional.entity';

// Type simple pour les coordonnées GPS
interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectRepository(Professional)
    private professionalsRepository: Repository<Professional>,
  ) {}

  async create(professionalData: Partial<Professional>): Promise<Professional> {
    const professional = this.professionalsRepository.create(professionalData);
    return this.professionalsRepository.save(professional);
  }

  async findById(id: string): Promise<Professional> {
    const professional = await this.professionalsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!professional) {
      throw new NotFoundException(`Professional with ID ${id} not found`);
    }
    return professional;
  }

  async findByUserId(userId: string): Promise<Professional | null> {
    return this.professionalsRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
  }

  // Recherche par rayon avec PostGIS (en mètres) - OPTIMISÉE avec index
  async searchByRadius(
    center: Point,
    radiusInMeters: number,
    paysCode?: string,
    profession?: string,
  ): Promise<Professional[]> {
    const query = this.professionalsRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.is_active = :isActive', { isActive: true })
      .andWhere('professional.position_gps IS NOT NULL')
      .andWhere(
        `ST_DWithin(
          professional.position_gps::geography,
          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
          :radius
        )`,
        {
          lng: center.coordinates[0],
          lat: center.coordinates[1],
          radius: radiusInMeters,
        },
      );

    if (paysCode) {
      query.andWhere('professional.pays_code = :paysCode', { paysCode });
    }

    if (profession) {
      query.andWhere('professional.profession ILIKE :profession', {
        profession: `%${profession}%`,
      });
    }

    // Limiter les résultats pour éviter les surcharges
    query.limit(100);

    return query.getMany();
  }

  async getPopular(limit: number = 10): Promise<Professional[]> {
    return this.professionalsRepository
      .createQueryBuilder('professional')
      .leftJoinAndSelect('professional.user', 'user')
      .where('professional.is_active = :isActive', { isActive: true })
      .orderBy('professional.rating', 'DESC')
      .limit(limit)
      .getMany();
  }

  async update(id: string, updateData: Partial<Professional>): Promise<Professional> {
    const professional = await this.findById(id);
    Object.assign(professional, updateData);
    return this.professionalsRepository.save(professional);
  }

  async delete(id: string): Promise<void> {
    const professional = await this.findById(id);
    await this.professionalsRepository.remove(professional);
  }

  async updateCNIDocument(id: string, cniDocumentUrl: string): Promise<Professional> {
    const professional = await this.findById(id);
    professional.cni_document_url = cniDocumentUrl;
    return this.professionalsRepository.save(professional);
  }
}

