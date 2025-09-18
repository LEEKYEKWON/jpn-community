'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

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

export default function MeetPage() {
  const { user, canWrite } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPosts()
  }, [currentPage, search])

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        category: '会いましょう',
        page: currentPage.toString(),
        limit: '10',
      })
      
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPosts()
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👥 会いましょう
          </h1>
          <p className="text-gray-600">
            他の会員と出会って交流しましょう
          </p>
        </div>

        {/* 검색 및 글쓰기 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="タイトルや内容で検索..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                >
                  検索
                </button>
              </div>
            </form>
            
            {canWrite ? (
              <Link
                href="/meet/write"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                投稿
              </Link>
            ) : user ? (
              <div className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed" title="自己紹介を登録してください">
                投稿 (自己紹介登録必要)
              </div>
            ) : null}
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="bg-white rounded-lg shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              まだ投稿がありません。
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link href={`/meet/${post.id}`} className="block">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-pink-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-1 text-gray-600 line-clamp-2">
                          {post.content}
                        </p>
                      </Link>
                      
                      <div className="mt-3 flex items-center text-sm text-gray-500 space-x-4">
                        <span>投稿者: {post.author.name}</span>
                        <span>閲覧: {post.viewCount}</span>
                        <span>コメント: {post._count.comments}</span>
                        <span>いいね: {post.likeCount}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  ページ {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    前へ
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    次へ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


