import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThan, LessThan } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Story } from './entities/story.entity';
import { StoryView } from './entities/story-view.entity';
import { StoryReaction } from './entities/story-reaction.entity';
import { Highlight } from './entities/highlight.entity';
import { HighlightStory } from './entities/highlight-story.entity';
import { Follow } from './entities/follow.entity';

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
    @InjectRepository(StoryView)
    private storyViewsRepository: Repository<StoryView>,
    @InjectRepository(StoryReaction)
    private storyReactionsRepository: Repository<StoryReaction>,
    @InjectRepository(Highlight)
    private highlightsRepository: Repository<Highlight>,
    @InjectRepository(HighlightStory)
    private highlightStoriesRepository: Repository<HighlightStory>,
    @InjectRepository(Follow)
    private followsRepository: Repository<Follow>,
    private dataSource: DataSource,
  ) {}

  /** Posts marqués ainsi n'apparaissent pas dans le feed général ; ils sont listés sur la fiche pro (Réalisations). */
  static readonly REALIZATION_METADATA_SCOPE = 'realization' as const;

  // Créer un post
  async createPost(data: {
    userId: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    paysCode?: string;
    /** Seul `{ scope: 'realization' }` est accepté pour limiter les abus. */
    metadata?: Record<string, unknown>;
  }): Promise<Post> {
    let metadata: Record<string, unknown> | undefined;
    if (data.metadata?.scope === SocialService.REALIZATION_METADATA_SCOPE) {
      metadata = { scope: SocialService.REALIZATION_METADATA_SCOPE };
    }

    const post = this.postsRepository.create({
      user_id: data.userId,
      content: data.content,
      image_url: data.imageUrl,
      video_url: data.videoUrl,
      pays_code: data.paysCode || 'CM',
      metadata,
    });

    return this.postsRepository.save(post);
  }

  /**
   * @param scope `global` = tous les posts publics ; `following` = uniquement les comptes suivis par userId (onglet « Amis »).
   */
  async getFeed(
    userId: string,
    paysCode?: string,
    cursor?: string,
    limit: number = 20,
    scope: 'global' | 'following' = 'global',
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    if (scope === 'following') {
      const followCount = await this.followsRepository.count({
        where: { follower_id: userId },
      });
      if (followCount === 0) {
        return { posts: [], nextCursor: null };
      }
    }

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .where('post.is_public = :isPublic', { isPublic: true })
      .andWhere(
        "COALESCE(post.metadata->>'scope', '') != :realizationScope",
        { realizationScope: SocialService.REALIZATION_METADATA_SCOPE },
      )
      .orderBy('post.created_at', 'DESC')
      .take(limit + 1);

    if (scope === 'following') {
      queryBuilder.andWhere(
        `post.user_id IN (SELECT f.following_id FROM babylone.follows f WHERE f.follower_id = :followerId)`,
        { followerId: userId },
      );
    }

    if (paysCode) {
      queryBuilder.andWhere('post.pays_code = :paysCode', { paysCode });
    }

    if (cursor) {
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

  // Obtenir un post par ID
  async getPostById(postId: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
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
  async getPostsByUser(userId: string, scope?: string): Promise<Post[]> {
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.user_id = :userId', { userId })
      .orderBy('post.created_at', 'DESC')
      .take(50);

    if (scope === SocialService.REALIZATION_METADATA_SCOPE) {
      qb.andWhere("post.metadata->>'scope' = :rs", {
        rs: SocialService.REALIZATION_METADATA_SCOPE,
      }).andWhere('post.is_public = :isPublic', { isPublic: true });
    }

    return qb.getMany();
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

  /**
   * Masque le nombre de vues pour les spectateurs : seul l'auteur de la story le voit.
   * Objet plain (sans spread d'entité TypeORM) pour une sérialisation JSON fiable.
   */
  private applyStoryViewsPrivacy(story: Story, viewerUserId: string): Story {
    if (!story || story.user_id === viewerUserId) {
      return story;
    }
    return {
      id: story.id,
      user_id: story.user_id,
      media_url: story.media_url,
      text: story.text,
      expires_at: story.expires_at,
      created_at: story.created_at,
      user: story.user,
    } as Story;
  }

  async getStoriesFeed(viewerUserId: string): Promise<Story[]> {
    const stories = await this.storiesRepository.find({
      where: { expires_at: MoreThan(new Date()) },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 50,
    });
    return stories.map((s) => this.applyStoryViewsPrivacy(s, viewerUserId));
  }

  async getMyStories(userId: string, archived: boolean): Promise<Story[]> {
    const where = archived
      ? { user_id: userId, expires_at: LessThan(new Date()) }
      : { user_id: userId, expires_at: MoreThan(new Date()) };
    return this.storiesRepository.find({
      where,
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async viewStory(id: string, viewerUserId: string): Promise<Story> {
    const story = await this.storiesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!story) {
      throw new NotFoundException('Story introuvable');
    }
    const existingView = await this.storyViewsRepository.findOne({
      where: { story_id: id, user_id: viewerUserId },
    });
    if (!existingView) {
      story.views_count += 1;
      await this.storiesRepository.save(story);
      await this.storyViewsRepository.save(
        this.storyViewsRepository.create({ story_id: id, user_id: viewerUserId }),
      );
    }
    return this.applyStoryViewsPrivacy(story, viewerUserId);
  }

  async getStoryViewers(storyId: string, requesterUserId: string): Promise<StoryView[]> {
    const story = await this.storiesRepository.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story introuvable');
    if (story.user_id !== requesterUserId) {
      throw new ForbiddenException('Seul l’auteur de la story peut voir la liste des vues');
    }
    return this.storyViewsRepository.find({
      where: { story_id: storyId },
      relations: ['user'],
      order: { viewed_at: 'DESC' },
      take: 100,
    });
  }

  /** Normalise les variantes Unicode (cœur nu vs ❤️, etc.) */
  private normalizeStoryReactionEmoji(raw: string): string | null {
    const s = (raw || '').trim();
    const allowed = ['❤️', '🔥', '😂'] as const;
    if (allowed.includes(s as (typeof allowed)[number])) return s;
    // Cœur sans sélecteur VS16
    if (s === '\u2764' || s === '\u2764\uFE0F') return '❤️';
    return null;
  }

  async addStoryReaction(storyId: string, userId: string, emoji: string): Promise<StoryReaction> {
    const story = await this.storiesRepository.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story introuvable');
    const canonical = this.normalizeStoryReactionEmoji(emoji);
    if (!canonical) {
      throw new ForbiddenException('Réaction non autorisée');
    }
    let reaction = await this.storyReactionsRepository.findOne({
      where: { story_id: storyId, user_id: userId },
    });
    if (reaction) {
      reaction.emoji = canonical;
    } else {
      reaction = this.storyReactionsRepository.create({ story_id: storyId, user_id: userId, emoji: canonical });
    }
    return this.storyReactionsRepository.save(reaction);
  }

  // --- HIGHLIGHTS (temps forts) ---

  async createHighlight(userId: string, title: string): Promise<Highlight> {
    const highlight = this.highlightsRepository.create({ user_id: userId, title });
    return this.highlightsRepository.save(highlight);
  }

  async getMyHighlights(userId: string): Promise<Highlight[]> {
    return this.highlightsRepository.find({
      where: { user_id: userId },
      relations: ['highlight_stories', 'highlight_stories.story'],
      order: { created_at: 'DESC' },
    });
  }

  async getHighlightsByUser(userId: string): Promise<Highlight[]> {
    return this.highlightsRepository.find({
      where: { user_id: userId },
      relations: ['highlight_stories', 'highlight_stories.story'],
      order: { created_at: 'DESC' },
    });
  }

  async getHighlightWithStories(
    highlightId: string,
    viewerUserId: string,
  ): Promise<{ highlight: Highlight; stories: Story[] }> {
    const highlight = await this.highlightsRepository.findOne({
      where: { id: highlightId },
      relations: ['user'],
    });
    if (!highlight) throw new NotFoundException('Temps fort introuvable');
    const rows = await this.highlightStoriesRepository.find({
      where: { highlight_id: highlightId },
      relations: ['story', 'story.user'],
      order: { position: 'ASC' },
    });
    const stories = rows
      .map((r) => r.story)
      .filter(Boolean)
      .map((s) => this.applyStoryViewsPrivacy(s as Story, viewerUserId));
    return { highlight, stories };
  }

  async addStoryToHighlight(highlightId: string, storyId: string, userId: string): Promise<HighlightStory> {
    const highlight = await this.highlightsRepository.findOne({ where: { id: highlightId } });
    if (!highlight) throw new NotFoundException('Temps fort introuvable');
    if (highlight.user_id !== userId) throw new ForbiddenException('Non autorisé');
    const story = await this.storiesRepository.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story introuvable');
    if (story.user_id !== userId) throw new ForbiddenException('Seules vos stories peuvent être ajoutées');
    const existing = await this.highlightStoriesRepository.findOne({
      where: { highlight_id: highlightId, story_id: storyId },
    });
    if (existing) return existing;
    const maxPos = await this.highlightStoriesRepository
      .createQueryBuilder('hs')
      .select('MAX(hs.position)', 'max')
      .where('hs.highlight_id = :id', { id: highlightId })
      .getRawOne();
    const position = (maxPos?.max ?? -1) + 1;
    const hs = this.highlightStoriesRepository.create({
      highlight_id: highlightId,
      story_id: storyId,
      position,
    });
    return this.highlightStoriesRepository.save(hs);
  }

  async removeStoryFromHighlight(highlightId: string, storyId: string, userId: string): Promise<void> {
    const highlight = await this.highlightsRepository.findOne({ where: { id: highlightId } });
    if (!highlight) throw new NotFoundException('Temps fort introuvable');
    if (highlight.user_id !== userId) throw new ForbiddenException('Non autorisé');
    await this.highlightStoriesRepository.delete({ highlight_id: highlightId, story_id: storyId });
  }

  async deleteHighlight(highlightId: string, userId: string): Promise<void> {
    const highlight = await this.highlightsRepository.findOne({ where: { id: highlightId } });
    if (!highlight) throw new NotFoundException('Temps fort introuvable');
    if (highlight.user_id !== userId) throw new ForbiddenException('Non autorisé');
    await this.highlightsRepository.remove(highlight);
  }

  // --- FOLLOW ---

  async follow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) throw new ForbiddenException('Vous ne pouvez pas vous suivre vous-même');
    const existing = await this.followsRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    if (existing) return { following: true };
    await this.followsRepository.save({
      follower_id: followerId,
      following_id: followingId,
    });
    return { following: true };
  }

  async unfollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    await this.followsRepository.delete({ follower_id: followerId, following_id: followingId });
    return { following: false };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const one = await this.followsRepository.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });
    return !!one;
  }

  /** Les deux se suivent mutuellement */
  async isMutual(userA: string, userB: string): Promise<boolean> {
    const [ab, ba] = await Promise.all([
      this.isFollowing(userA, userB),
      this.isFollowing(userB, userA),
    ]);
    return ab && ba;
  }

  async getFollowersCount(userId: string): Promise<number> {
    return this.followsRepository.count({ where: { following_id: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followsRepository.count({ where: { follower_id: userId } });
  }

  async getFollowers(userId: string, limit = 50): Promise<Follow[]> {
    return this.followsRepository.find({
      where: { following_id: userId },
      relations: ['follower'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getFollowing(userId: string, limit = 50): Promise<Follow[]> {
    return this.followsRepository.find({
      where: { follower_id: userId },
      relations: ['following'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
