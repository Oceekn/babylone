import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Story } from './entities/story.entity';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
    private dataSource: DataSource,
  ) {}

  // Créer un post
  async createPost(data: {
    userId: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    paysCode?: string;
  }): Promise<Post> {
    const post = this.postsRepository.create({
      user_id: data.userId,
      content: data.content,
      image_url: data.imageUrl,
      video_url: data.videoUrl,
      pays_code: data.paysCode || 'CM',
    });

    return this.postsRepository.save(post);
  }

  // Obtenir le feed avec pagination par curseur (OPTIMISÉ)
  async getFeed(
    userId: string,
    paysCode?: string,
    cursor?: string,
    limit: number = 20,
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.is_public = :isPublic', { isPublic: true })
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1); // Prendre un de plus pour vérifier s'il y a une page suivante

    if (paysCode) {
      queryBuilder.andWhere('post.pays_code = :paysCode', { paysCode });
    }

    if (cursor) {
      // Pagination par curseur (plus rapide que OFFSET)
      const cursorPost = await this.postsRepository.findOne({ where: { id: cursor } });
      if (cursorPost) {
        queryBuilder.andWhere('post.created_at < :cursorDate', {
          cursorDate: cursorPost.created_at,
        });
      }
    }

    const posts = await queryBuilder.getMany();
    const hasMore = posts.length > limit;
    const postsToReturn = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore && postsToReturn.length > 0 ? postsToReturn[postsToReturn.length - 1].id : null;

    return {
      posts: postsToReturn,
      nextCursor,
    };
  }

  // Ajouter un commentaire
  async addComment(postId: string, userId: string, content: string, parentId?: string): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const comment = this.commentsRepository.create({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId,
      });

      const savedComment = await queryRunner.manager.save(Comment, comment);

      // Incrémenter le compteur de commentaires
      await queryRunner.manager.increment(Post, { id: postId }, 'comments_count', 1);

      await queryRunner.commitTransaction();

      return this.commentsRepository.findOne({
        where: { id: savedComment.id },
        relations: ['user'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Ajouter/Retirer un like
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingLike = await queryRunner.manager.findOne(Like, {
        where: { post_id: postId, user_id: userId },
      });

      if (existingLike) {
        // Retirer le like
        await queryRunner.manager.remove(Like, existingLike);
        await queryRunner.manager.decrement(Post, { id: postId }, 'likes_count', 1);
        await queryRunner.commitTransaction();

        const updatedPost = await this.postsRepository.findOne({ where: { id: postId } });
        return { liked: false, likesCount: updatedPost.likes_count };
      } else {
        // Ajouter le like
        const like = this.likesRepository.create({
          post_id: postId,
          user_id: userId,
        });
        await queryRunner.manager.save(Like, like);
        await queryRunner.manager.increment(Post, { id: postId }, 'likes_count', 1);
        await queryRunner.commitTransaction();

        const updatedPost = await this.postsRepository.findOne({ where: { id: postId } });
        return { liked: true, likesCount: updatedPost.likes_count };
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Obtenir les commentaires d'un post avec pagination par curseur
  async getComments(
    postId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{ comments: Comment[]; nextCursor: string | null }> {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.post_id = :postId', { postId })
      .andWhere('comment.parent_id IS NULL') // Seulement les commentaires racines
      .orderBy('comment.created_at', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const cursorComment = await this.commentsRepository.findOne({ where: { id: cursor } });
      if (cursorComment) {
        queryBuilder.andWhere('comment.created_at < :cursorDate', {
          cursorDate: cursorComment.created_at,
        });
      }
    }

    const comments = await queryBuilder.getMany();
    const hasMore = comments.length > limit;
    const commentsToReturn = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore && commentsToReturn.length > 0 ? commentsToReturn[commentsToReturn.length - 1].id : null;

    return {
      comments: commentsToReturn.reverse(),
      nextCursor,
    };
  }

  // Posts d'un utilisateur
  async getPostsByUser(userId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { user_id: userId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  // --- STORIES ---

  async createStory(userId: string, text?: string, mediaUrl?: string): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // expire dans 24h

    const story = this.storiesRepository.create({
      user_id: userId,
      text,
      media_url: mediaUrl,
      expires_at: expiresAt,
    });
    return this.storiesRepository.save(story);
  }

  async getStoriesFeed(): Promise<Story[]> {
    return this.storiesRepository.find({
      where: { expires_at: MoreThan(new Date()) },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 50,
    });
  }

  async viewStory(id: string): Promise<Story> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!story) {
      throw new NotFoundException('Story introuvable');
    }
    // Incrementer les vues
    story.views_count += 1;
    await this.storiesRepository.save(story);
    return story;
  }
}
