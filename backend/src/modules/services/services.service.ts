import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(serviceData: Partial<Service>): Promise<Service> {
    const service = this.servicesRepository.create(serviceData);
    return this.servicesRepository.save(service);
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

  async findByProfessionalId(professionalId: string): Promise<Service[]> {
    return this.servicesRepository.find({
      where: { professional_id: professionalId, is_active: true },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Service>): Promise<Service> {
    const service = await this.findById(id);
    Object.assign(service, updateData);
    return this.servicesRepository.save(service);
  }

  async delete(id: string): Promise<void> {
    const service = await this.findById(id);
    await this.servicesRepository.remove(service);
  }
}

