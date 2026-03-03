import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ScreenLayout from '../../components/common/ScreenLayout'
import Button from '../../components/common/Button'
import { Heart, MessageCircle, Share2, Loader, Send } from 'lucide-react'
import { socialService, Post, Comment } from '../../services/social.service'
import { formatTimeAgo } from '../../utils/date'
import './PostDetail.css'

const PostDetail = () => {
  const { id: postId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (postId) loadPost()
  }, [postId])

  const loadPost = async () => {
    if (!postId) return
    try {
      setLoading(true)
      const [postData, commentsData] = await Promise.all([
        socialService.getPost(postId),
        socialService.getComments(postId, undefined, 50),
      ])
      setPost(postData)
      setComments(commentsData?.comments ?? [])
    } catch {
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!postId || !post) return
    try {
      const response = await socialService.toggleLike(postId) as { liked: boolean; likes_count?: number; likesCount?: number }
      const count = response.likes_count ?? response.likesCount ?? 0
      setPost({ ...post, likes_count: count })
      setLiked(!!response.liked)
    } catch (err) {
      console.error('Erreur like:', err)
    }
  }

  const handleAddComment = async () => {
    const text = commentText.trim()
    if (!postId || !text || sendingComment) return
    setSendingComment(true)
    try {
      await socialService.addComment(postId, text)
      setCommentText('')
      const commentsData = await socialService.getComments(postId, undefined, 50)
      setComments(commentsData?.comments ?? [])
      setPost(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : null)
    } catch (err) {
      console.error('Erreur commentaire:', err)
    } finally {
      setSendingComment(false)
    }
  }

  const getUserName = (p: Post) => {
    if (p.user) return `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() || 'Utilisateur'
    return 'Utilisateur'
  }

  const getCommentAuthor = (c: Comment) => {
    if (c.user) return `${c.user.first_name || ''} ${c.user.last_name || ''}`.trim() || 'Utilisateur'
    return 'Utilisateur'
  }

  const formatTime = (dateString: string) => formatTimeAgo(dateString)

  const videoUrl = post?.video_url ?? (post as { videoUrl?: string })?.videoUrl

  if (loading) {
    return (
      <ScreenLayout title="Publication" showBack>
        <div className="post-detail-loading">
          <Loader size={32} className="spin" />
          <p>Chargement...</p>
        </div>
      </ScreenLayout>
    )
  }

  if (!post) {
    return (
      <ScreenLayout title="Publication" showBack>
        <div className="post-detail-not-found">
          <p>Publication introuvable</p>
          <Button variant="outline" onClick={() => navigate('/social')}>Retour au feed</Button>
        </div>
      </ScreenLayout>
    )
  }

  return (
    <ScreenLayout title="Publication" showBack>
      <div className="post-detail">
        <div className="post-detail-card">
          {videoUrl && (
            <video src={videoUrl} controls playsInline className="post-detail-media post-detail-video" />
          )}
          {post.image_url && !videoUrl && (
            <div className="post-detail-media post-detail-image">
              <img src={post.image_url} alt="Post" />
            </div>
          )}
          <div className="post-detail-content">
            <div className="post-detail-header">
              <span className="post-detail-author">{getUserName(post)}</span>
              <span className="post-detail-time">{formatTime(post.created_at)}</span>
            </div>
            {post.content && <p className="post-detail-text">{post.content}</p>}
            <div className="post-detail-engagement">
              <button
                type="button"
                className="post-detail-btn"
                onClick={handleLike}
                style={{ color: liked ? '#FF3131' : 'inherit' }}
              >
                <Heart size={20} fill={liked ? '#FF3131' : 'none'} /> {post.likes_count || 0}
              </button>
              <span className="post-detail-btn post-detail-btn-disabled">
                <MessageCircle size={20} /> {post.comments_count ?? comments.length}
              </span>
              <button
                type="button"
                className="post-detail-btn"
                onClick={() => navigator.share?.({ title: getUserName(post), text: post.content || '', url: window.location.href })}
              >
                <Share2 size={20} /> Partager
              </button>
            </div>
          </div>
        </div>

        <div className="post-detail-comments">
          <div className="post-detail-comments-card">
            <h3 className="post-detail-comments-title">
              <MessageCircle size={20} />
              Commentaires <span className="post-detail-comments-count">{post.comments_count ?? comments.length}</span>
            </h3>
            <div className="post-detail-comment-form">
              <textarea
                className="post-detail-comment-input"
                placeholder="Écrire un commentaire..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
              />
              <button
                type="button"
                className="post-detail-comment-submit"
                onClick={handleAddComment}
                disabled={!commentText.trim() || sendingComment}
              >
                {sendingComment ? <Loader size={18} className="spin" /> : <Send size={18} />}
                <span>{sendingComment ? 'Envoi...' : 'Publier'}</span>
              </button>
            </div>
            <ul className="post-detail-comment-list">
              {comments.length === 0 ? (
                <li className="post-detail-comment-empty">
                  <MessageCircle size={32} />
                  <p>Aucun commentaire pour le moment.</p>
                  <span>Soyez le premier à réagir !</span>
                </li>
              ) : (
                comments.map((c) => (
                  <li key={c.id} className="post-detail-comment-item">
                    <div className="post-detail-comment-avatar">
                      {(c.user?.first_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="post-detail-comment-body">
                      <div className="post-detail-comment-meta">
                        <span className="post-detail-comment-author">{getCommentAuthor(c)}</span>
                        <span className="post-detail-comment-time">{formatTime(c.created_at)}</span>
                      </div>
                      <p className="post-detail-comment-content">{c.content}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}

export default PostDetail
