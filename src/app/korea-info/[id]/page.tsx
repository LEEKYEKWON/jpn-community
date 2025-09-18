'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Post {
  id: string
  title: string
  content: string
  category: string
  author: {
    id: string
    name: string
  }
  viewCount: number
  likeCount: number
  createdAt: string
  _count: {
    comments: number
  }
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
  }
  createdAt: string
  replies: Comment[]
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, canWrite } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  useEffect(() => {
    if (params.id) {
      fetchPost()
    }
  }, [params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
        setComments(data.comments || [])
        // 수정 폼 초기값 설정
        setEditForm({ title: data.post.title, content: data.post.content })
      } else {
        console.error('게시글 조회 실패')
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          postId: params.id,
          authorId: user.id,
        }),
      })

      if (response.ok) {
        setNewComment('')
        fetchPost() // 댓글 목록 새로고침
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editForm.title.trim() || !editForm.content.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          userId: user.id,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        fetchPost() // 게시글 새로고침
        alert('投稿が修正されました。')
      } else {
        alert('修正に失敗しました。')
      }
    } catch (error) {
      console.error('게시글 수정 오류:', error)
      alert('修正中にエラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!user || !confirm('投稿を削除しますか？')) return

    try {
      const response = await fetch(`/api/posts/${params.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        alert('投稿が削除されました。')
        router.push('/korea-info') // 게시판 목록으로 이동
      } else {
        alert('削除に失敗しました。')
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error)
      alert('削除中にエラーが発生しました。')
    }
  }

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId)
    setEditCommentContent(content)
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!user || !editCommentContent.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editCommentContent,
          userId: user.id,
        }),
      })

      if (response.ok) {
        setEditingCommentId(null)
        setEditCommentContent('')
        fetchPost() // 댓글 목록 새로고침
        alert('コメントが修正されました。')
      } else {
        alert('修正に失敗しました。')
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error)
      alert('修正中にエラーが発生しました。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !confirm('コメントを削除しますか？')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        fetchPost() // 댓글 목록 새로고침
        alert('コメントが削除されました。')
      } else {
        alert('削除に失敗しました。')
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
      alert('削除中にエラーが発生しました。')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">投稿が見つかりません</h1>
            <button
              onClick={() => router.back()}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 게시글 내용 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {!isEditing ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
                  {/* 작성자만 보이는 수정/삭제 버튼 */}
                  {user && user.id === post.author.id && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 transition-colors"
                      >
                        修正
                      </button>
                      <button
                        onClick={handleDeletePost}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                  <span>投稿者: {post.author.name}</span>
                  <span>閲覧: {post.viewCount}</span>
                  <span>コメント: {post._count.comments}</span>
                  <span>いいね: {post.likeCount}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {post.content}
                </div>
              </div>
            </>
          ) : (
            /* 수정 폼 */
            <form onSubmit={handleEditPost}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  rows={10}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? '修正中...' : '修正完了'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">コメント ({comments.length})</h2>
          
          {/* 댓글 작성 */}
          {canWrite ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="コメントを入力してください..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  rows={3}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                {submitting ? '投稿中...' : 'コメント投稿'}
              </button>
            </form>
          ) : user ? (
            <div className="mb-8 p-4 bg-gray-100 rounded-md text-center">
              <p className="text-gray-600">コメントを投稿するには自己紹介を登録してください</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                自己紹介登録へ
              </button>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 rounded-md text-center">
              <p className="text-gray-600">コメントを投稿するにはログインが必要です</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
              >
                ログイン
              </button>
            </div>
          )}

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                まだコメントがありません。
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{comment.author.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* 댓글 작성자만 보이는 수정/삭제 버튼 */}
                    {user && user.id === comment.author.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditComment(comment.id, comment.content)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        >
                          修正
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    /* 댓글 수정 폼 */
                    <div className="space-y-2">
                      <textarea
                        value={editCommentContent}
                        onChange={(e) => setEditCommentContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        rows={3}
                        required
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={submitting}
                          className="bg-pink-500 text-white px-3 py-1 rounded-md text-sm hover:bg-pink-600 transition-colors disabled:opacity-50"
                        >
                          {submitting ? '修正中...' : '修正完了'}
                        </button>
                        <button
                          onClick={handleCancelEditComment}
                          className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 댓글 내용 */
                    <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
