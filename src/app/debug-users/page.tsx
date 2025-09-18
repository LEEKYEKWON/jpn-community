'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'

interface User {
  id: string
  email: string
  name: string
  bio?: string
  latitude?: number
  longitude?: number
  address?: string
  isAdmin: boolean
  isApproved: boolean
  createdAt: string
}

interface Stats {
  totalUsers: number
  usersWithLocation: number
  admins: number
  approved: number
}

export default function DebugUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/debug/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('사용자 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">사용자 디버그 정보</h1>
          
          {/* 통계 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-800">{stats.totalUsers}</div>
                <div className="text-sm text-blue-600">전체 사용자</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-800">{stats.usersWithLocation}</div>
                <div className="text-sm text-green-600">위치 등록됨</div>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-800">{stats.admins}</div>
                <div className="text-sm text-red-600">관리자</div>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-800">{stats.approved}</div>
                <div className="text-sm text-yellow-600">승인됨</div>
              </div>
            </div>
          )}

          {/* 사용자 목록 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사용자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    권한
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.bio && (
                          <div className="text-xs text-gray-400 mt-1">{user.bio.substring(0, 50)}...</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.latitude && user.longitude ? (
                        <div className="text-sm text-green-600">
                          <div>위도: {user.latitude.toFixed(4)}</div>
                          <div>경도: {user.longitude.toFixed(4)}</div>
                          {user.address && <div className="text-xs">{user.address}</div>}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">위치 미등록</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isAdmin 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isAdmin ? '관리자' : '일반'}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? '승인됨' : '대기중'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 bg-yellow-100 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">확인사항:</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li><strong>위치 등록됨</strong> 사용자만 지도에 마커가 표시됩니다</li>
              <li>시드 데이터 생성 시 기존 사용자 데이터가 삭제되었을 수 있습니다</li>
              <li>안전한 시드 데이터 생성: <code>npm run db:seed-safe</code></li>
              <li>새로운 테스트 데이터가 필요하면 관리자 페이지에서 수동 생성 가능</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
