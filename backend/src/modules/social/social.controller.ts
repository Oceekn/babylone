import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
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
    @Body()
    body: {
      content?: string;
      image_url?: string;
      video_url?: string;
      pays_code?: string;
      metadata?: Record<string, unknown>;
    },
    @Request() req,
  ) {
    return this.socialService.createPost({
      userId: req.user.id,
      content: body.content,
      imageUrl: body.image_url,
      videoUrl: body.video_url,
      paysCode: body.pays_code || req.user.pays_code,
      metadata: body.metadata,
    });
  }

  @Get('posts/:postId')
  @UseGuards(JwtAuthGuard)
  async getPost(@Param('postId') postId: string) {
    return this.socialService.getPostById(postId);
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
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('scope') scope?: string,
  ) {
    return this.socialService.getPostsByUser(userId, scope);
  }

  // --- FOLLOW ---
  @Post('follow/:userId')
  @UseGuards(JwtAuthGuard)
  async follow(@Param('userId') userId: string, @Request() req) {
    return this.socialService.follow(req.user.id, userId);
  }

  @Delete('follow/:userId')
  @UseGuards(JwtAuthGuard)
  async unfollow(@Param('userId') userId: string, @Request() req) {
    return this.socialService.unfollow(req.user.id, userId);
  }

  @Get('users/:userId/follow-status')
  @UseGuards(JwtAuthGuard)
  async getFollowStatus(@Param('userId') userId: string, @Request() req) {
    const following = await this.socialService.isFollowing(req.user.id, userId);
    return { following };
  }

  @Get('users/:userId/follow-counts')
  @UseGuards(JwtAuthGuard)
  async getFollowCounts(@Param('userId') userId: string) {
    const [followers, following] = await Promise.all([
      this.socialService.getFollowersCount(userId),
      this.socialService.getFollowingCount(userId),
    ]);
    return { followers, following };
  }

  @Get('users/:userId/followers')
  @UseGuards(JwtAuthGuard)
  async getFollowers(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.socialService.getFollowers(userId, limit ? parseInt(limit, 10) : 50);
  }

  @Get('users/:userId/following')
  @UseGuards(JwtAuthGuard)
  async getFollowing(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.socialService.getFollowing(userId, limit ? parseInt(limit, 10) : 50);
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
  async getStories(@Request() req) {
    return this.socialService.getStoriesFeed(req.user.id);
  }

  // Mes stories (actives ou archive)
  @Get('stories/me')
  @UseGuards(JwtAuthGuard)
  async getMyStories(@Query('archived') archived: string, @Request() req) {
    return this.socialService.getMyStories(req.user.id, archived === 'true');
  }

  // Liste des viewers (uniquement pour l'auteur de la story) — route plus spécifique avant :id
  @Get('stories/:id/viewers')
  @UseGuards(JwtAuthGuard)
  async getStoryViewers(@Param('id') id: string, @Request() req) {
    return this.socialService.getStoryViewers(id, req.user.id);
  }

  // Réaction rapide (❤️, 🔥, 😂)
  @Post('stories/:id/reaction')
  @UseGuards(JwtAuthGuard)
  async addStoryReaction(
    @Param('id') id: string,
    @Body() body: { emoji: string },
    @Request() req,
  ) {
    return this.socialService.addStoryReaction(id, req.user.id, body.emoji);
  }

  // Voir une story (enregistre la vue pour l'utilisateur connecté)
  @Get('stories/:id')
  @UseGuards(JwtAuthGuard)
  async getStory(@Param('id') id: string, @Request() req) {
    return this.socialService.viewStory(id, req.user.id);
  }

  // --- HIGHLIGHTS (temps forts) ---

  @Post('highlights')
  @UseGuards(JwtAuthGuard)
  async createHighlight(@Body() body: { title: string }, @Request() req) {
    return this.socialService.createHighlight(req.user.id, body.title);
  }

  @Get('highlights/me')
  @UseGuards(JwtAuthGuard)
  async getMyHighlights(@Request() req) {
    return this.socialService.getMyHighlights(req.user.id);
  }

  @Get('users/:userId/highlights')
  @UseGuards(JwtAuthGuard)
  async getUserHighlights(@Param('userId') userId: string) {
    return this.socialService.getHighlightsByUser(userId);
  }

  @Get('highlights/:id')
  @UseGuards(JwtAuthGuard)
  async getHighlight(@Param('id') id: string, @Request() req) {
    return this.socialService.getHighlightWithStories(id, req.user.id);
  }

  @Post('highlights/:id/stories')
  @UseGuards(JwtAuthGuard)
  async addStoryToHighlight(
    @Param('id') id: string,
    @Body() body: { story_id: string },
    @Request() req,
  ) {
    return this.socialService.addStoryToHighlight(id, body.story_id, req.user.id);
  }

  @Delete('highlights/:id/stories/:storyId')
  @UseGuards(JwtAuthGuard)
  async removeStoryFromHighlight(
    @Param('id') id: string,
    @Param('storyId') storyId: string,
    @Request() req,
  ) {
    await this.socialService.removeStoryFromHighlight(id, storyId, req.user.id);
  }

  @Delete('highlights/:id')
  @UseGuards(JwtAuthGuard)
  async deleteHighlight(@Param('id') id: string, @Request() req) {
    await this.socialService.deleteHighlight(id, req.user.id);
  }
}
