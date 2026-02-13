import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfessionalRoleGuard } from '../auth/guards/professional-role.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { StorageService } from '../storage/storage.service';
import { ProfessionalsService } from '../professionals/professionals.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly storageService: StorageService,
    private readonly professionalsService: ProfessionalsService,
  ) {}

  // Routes specifiques AVANT les routes parametrees
  @Get('my-services')
  @UseGuards(JwtAuthGuard)
  async getMyServices(@Request() req) {
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional) {
      return [];
    }
    return this.servicesService.findByProfessionalId(professional.id);
  }

  @Get('professional/:professionalId')
  async findByProfessional(@Param('professionalId') professionalId: string) {
    return this.servicesService.findByProfessionalId(professionalId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateServiceDto, @Request() req) {
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional) {
      throw new Error('Professional profile not found');
    }
    // Forcer le professional_id
    return this.servicesService.create({
      ...createDto,
      professional_id: professional.id,
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceDto,
    @Request() req,
  ) {
    const service = await this.servicesService.findById(id);
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || service.professional_id !== professional.id) {
      throw new Error('Unauthorized');
    }
    return this.servicesService.update(id, updateDto);
  }

  @Post(':id/upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const service = await this.servicesService.findById(id);
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || service.professional_id !== professional.id) {
      throw new Error('Unauthorized');
    }

    const objectName = await this.storageService.uploadFile(
      file.buffer,
      `service-${id}-${file.originalname}`,
      file.mimetype,
    );
    const fileUrl = await this.storageService.getFileUrl(objectName);
    await this.servicesService.update(id, { image_url: fileUrl });

    return { message: 'Image uploadee', url: fileUrl, objectName };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req) {
    const service = await this.servicesService.findById(id);
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || service.professional_id !== professional.id) {
      throw new Error('Unauthorized');
    }
    await this.servicesService.delete(id);
  }
}
