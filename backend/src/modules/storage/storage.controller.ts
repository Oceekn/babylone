import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  // Upload protege (utilisateur connecte)
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const objectName = await this.storageService.uploadFile(
      file.buffer,
      `${req.user.id}-${Date.now()}-${file.originalname}`,
      file.mimetype,
    );

    const fileUrl = await this.storageService.getFileUrl(objectName);

    return {
      message: 'File uploaded successfully',
      url: fileUrl,
      objectName,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  // Upload public (inscription — pas de token JWT requis)
  @Post('upload-public')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPublic(
    @UploadedFile() file: Express.Multer.File,
  ) {
    const objectName = await this.storageService.uploadFile(
      file.buffer,
      `signup-${Date.now()}-${file.originalname}`,
      file.mimetype,
    );

    const fileUrl = await this.storageService.getFileUrl(objectName);

    return {
      message: 'File uploaded successfully',
      url: fileUrl,
      objectName,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

