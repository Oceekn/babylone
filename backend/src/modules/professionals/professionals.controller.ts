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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfessionalsService } from './professionals.service';
import { UsersService } from '../users/users.service';
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
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get('popular')
  async getPopular(@Query('limit') limit?: string) {
    const n = limit ? Math.min(parseInt(limit, 10) || 10, 50) : 10;
    return this.professionalsService.getPopular(n);
  }

  @Get('search')
  async search(@Query() searchDto: SearchProfessionalsDto) {
    const center: Point = {
      type: 'Point',
      coordinates: [parseFloat(searchDto.longitude), parseFloat(searchDto.latitude)],
    };
    const byRadius = await this.professionalsService.searchByRadius(
      center,
      searchDto.radius || 10000,
      searchDto.pays_code,
      searchDto.profession,
    );
    // Si aucun résultat (ex. pros sans position GPS), afficher les pros actifs du pays
    if (byRadius.length === 0) {
      return this.professionalsService.findActiveByPays(
        50,
        searchDto.pays_code,
        searchDto.profession,
      );
    }
    return byRadius;
  }

  @Get('my-profile')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Request() req) {
    const professional = await this.professionalsService.findByUserId(req.user.id);
    if (!professional) {
      return null;
    }
    // Ne pas modifier le rôle en base : la redirection après login reste selon l'inscription (client vs pro)
    return professional;
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

    const professional = await this.professionalsService.create(professionalData);
    // Ne pas forcer le rôle à PROFESSIONAL : l'utilisateur garde son rôle d'inscription pour la redirection login
    return professional;
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
    delete updateData.position;

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

