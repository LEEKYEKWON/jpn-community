'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  bio?: string
  // birthDate?: string // 스키마 충돌로 임시 제외
  // origin?: string    // 스키마 충돌로 임시 제거
  latitude?: number
  longitude?: number
  address?: string
  isAdmin: boolean
  isApproved: boolean
  createdAt: string
  _count: {
    posts: number
    comments: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  viewCount: number
  likeCount: number
  createdAt: string
  author: {
    id: string
    name: string
  }
  _count: {
    comments: number
  }
}

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'stats'>('stats')
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  // 관리자 권한 확인
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    if (!user.isAdmin) {
      router.push('/')
      return
    }
    fetchData()
  }, [user, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 병렬로 데이터 가져오기
      const [usersResponse, postsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/posts')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts)
      }
    } catch (error) {
      console.error('관리자 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserApproval = async (userId: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/admin/users/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved }),
      })

      if (response.ok) {
        alert(isApproved ? '사용자가 승인되었습니다' : '사용자 승인이 취소되었습니다')
        fetchData()
      }
    } catch (error) {
      alert('승인 처리 중 오류가 발생했습니다')
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('게시글이 삭제되었습니다')
        fetchData()
      }
    } catch (error) {
      alert('게시글 삭제 중 오류가 발생했습니다')
    }
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    )
  }

  const totalUsers = users.length
  const approvedUsers = users.filter(u => u.isApproved).length
  const totalPosts = posts.length
  const totalViews = posts.reduce((sum, post) => sum + post.viewCount, 0)

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ 管理者ページ</h1>
          <p className="text-gray-600">コミュニティの運営管理を行います</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'stats', label: '統計', icon: '📊' },
                { id: 'users', label: '会員管理', icon: '👥' },
                { id: 'posts', label: '投稿管理', icon: '📝' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">データを読み込み中...</div>
          </div>
        ) : (
          <>
            {/* 통계 탭 */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="text-3xl">👥</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">総会員数</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="text-3xl">✅</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">承認済み会員</p>
                      <p className="text-2xl font-bold text-gray-900">{approvedUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="text-3xl">📝</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">総投稿数</p>
                      <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="text-3xl">👁️</div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">総閲覧数</p>
                      <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 회원 관리 탭 */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">会員一覧</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会員情報</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">活動</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状態</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                              <div className="text-sm text-gray-500">{userData.email}</div>
                              {userData.birthDate && (
                                <div className="text-xs text-gray-400">生年月日: {userData.birthDate}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {userData.latitude ? '✅ 登録済み' : '❌ 未登録'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>投稿: {userData._count.posts}</div>
                            <div>コメント: {userData._count.comments}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userData.isApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userData.isApproved ? '승인됨' : '승인대기'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleUserApproval(userData.id, !userData.isApproved)}
                              className={`mr-2 px-3 py-1 rounded text-xs ${
                                userData.isApproved
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {userData.isApproved ? '승인취소' : '승인'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 게시글 관리 탭 */}
            {activeTab === 'posts' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">投稿一覧</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投稿情報</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成者</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">統計</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{post.title}</div>
                              <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('ja-JP')}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {post.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {post.author.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>閲覧: {post.viewCount}</div>
                            <div>コメント: {post._count.comments}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
