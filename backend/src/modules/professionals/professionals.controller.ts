import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalsService } from './professionals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfessionalRoleGuard } from '../auth/guards/professional-role.guard';
import { SearchProfessionalsDto } from './dto/search-professionals.dto';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { StorageService } from '../storage/storage.service';

// Type simple pour les coordonnées GPS
interface Point {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly professionalsService: ProfessionalsService,
    private readonly storageService: StorageService,
  ) {}

  @Get('popular')
  async getPopular() {
    return this.professionalsService.getPopular();
  }

  @Get('search')
  async search(@Query() searchDto: SearchProfessionalsDto) {
    const center: Point = {
      type: 'Point',
      coordinates: [parseFloat(searchDto.longitude), parseFloat(searchDto.latitude)],
    };
    return this.professionalsService.searchByRadius(
      center,
      searchDto.radius || 10000, // 10km par défaut
      searchDto.pays_code,
      searchDto.profession,
    );
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard, ProfessionalRoleGuard)
  async getMyProfile(@Request() req) {
    return this.professionalsService.findByUserId(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateProfessionalDto, @Request() req) {
    const professionalData: any = {
      ...createDto,
      user_id: req.user.id,
      pays_code: createDto.pays_code || req.user.pays_code || 'CM',
    };

    if (createDto.position) {
      professionalData.position_gps = {
        type: 'Point',
        coordinates: [createDto.position.longitude, createDto.position.latitude],
      };
    }

    return this.professionalsService.create(professionalData);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ProfessionalRoleGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProfessionalDto,
    @Request() req,
  ) {
    // Vérifier que le professionnel appartient à l'utilisateur
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || professional.id !== id) {
      throw new Error('Unauthorized');
    }

    const updateData: any = { ...updateDto };
    if (updateDto.position) {
      updateData.position_gps = {
        type: 'Point',
        coordinates: [updateDto.position.longitude, updateDto.position.latitude],
      };
    }

    return this.professionalsService.update(id, updateData);
  }

  @Post(':id/upload-cni')
  @UseGuards(JwtAuthGuard, ProfessionalRoleGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCNI(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    // Vérifier que le professionnel appartient à l'utilisateur
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || professional.id !== id) {
      throw new Error('Unauthorized');
    }

    // Upload vers MinIO
    const objectName = await this.storageService.uploadFile(
      file.buffer,
      `cni-${id}-${file.originalname}`,
      file.mimetype,
    );

    // Générer l'URL signée
    const fileUrl = await this.storageService.getFileUrl(objectName);

    // Mettre à jour le professionnel
    await this.professionalsService.updateCNIDocument(id, fileUrl);

    return {
      message: 'CNI document uploaded successfully',
      url: fileUrl,
      objectName,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.professionalsService.findById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ProfessionalRoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req) {
    // Vérifier que le professionnel appartient à l'utilisateur
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional || professional.id !== id) {
      throw new Error('Unauthorized');
    }

    await this.professionalsService.delete(id);
  }
}

