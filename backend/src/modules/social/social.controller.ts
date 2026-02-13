import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from '../storage/storage.service';

@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly storageService: StorageService,
  ) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
    @Query('pays_code') paysCode: string,
    @Request() req,
  ) {
    return this.socialService.getFeed(
      req.user.id,
      paysCode,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() body: { content?: string; image_url?: string; video_url?: string; pays_code?: string },
    @Request() req,
  ) {
    return this.socialService.createPost({
      userId: req.user.id,
      content: body.content,
      imageUrl: body.image_url,
      videoUrl: body.video_url,
      paysCode: body.pays_code || req.user.pays_code,
    });
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Param('postId') postId: string,
    @Body() body: { content: string; parent_id?: string },
    @Request() req,
  ) {
    return this.socialService.addComment(postId, req.user.id, body.content, body.parent_id);
  }

  @Get('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  async getComments(
    @Param('postId') postId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
  ) {
    return this.socialService.getComments(postId, cursor, limit ? parseInt(limit, 10) : 50);
  }

  @Post('posts/:postId/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('postId') postId: string, @Request() req) {
    return this.socialService.toggleLike(postId, req.user.id);
  }

  // Posts d'un utilisateur
  @Get('users/:userId/posts')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@Param('userId') userId: string) {
    return this.socialService.getPostsByUser(userId);
  }

  // --- STORIES ---

  // Creer une story
  @Post('stories')
  @UseGuards(JwtAuthGuard)
  async createStory(
    @Body() body: { text?: string; media_url?: string },
    @Request() req,
  ) {
    return this.socialService.createStory(req.user.id, body.text, body.media_url);
  }

  // Upload media et creer une story
  @Post('stories/upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createStoryWithUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { text?: string },
    @Request() req,
  ) {
    let mediaUrl: string | undefined;
    if (file) {
      const objectName = await this.storageService.uploadFile(
        file.buffer,
        `story-${req.user.id}-${Date.now()}-${file.originalname}`,
        file.mimetype,
      );
      mediaUrl = await this.storageService.getFileUrl(objectName);
    }
    return this.socialService.createStory(req.user.id, body.text, mediaUrl);
  }

  // Feed des stories (non expirees)
  @Get('stories')
  @UseGuards(JwtAuthGuard)
  async getStories() {
    return this.socialService.getStoriesFeed();
  }

  // Voir une story
  @Get('stories/:id')
  @UseGuards(JwtAuthGuard)
  async getStory(@Param('id') id: string) {
    return this.socialService.viewStory(id);
  }
}
