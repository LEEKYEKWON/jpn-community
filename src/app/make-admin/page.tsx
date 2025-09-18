'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'

export default function MakeAdminPage() {
  const [email, setEmail] = useState('abc@naver.com')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [userInfo, setUserInfo] = useState<any>(null)
  const [newPassword, setNewPassword] = useState('123456')

  const handleCheckUser = async () => {
    if (!email) {
      setMessage('이메일을 입력해주세요')
      return
    }

    setLoading(true)
    setMessage('')
    setUserInfo(null)

    try {
      const response = await fetch('/api/admin/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setUserInfo(data.user)
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 사용자 확인 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async () => {
    if (!email) {
      setMessage('이메일을 입력해주세요')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email || !newPassword) {
      setMessage('이메일과 새 비밀번호를 입력해주세요')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        // 사용자 정보 새로고침
        handleCheckUser()
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 비밀번호 변경 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">관리자 권한 설정</h1>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="관리자로 설정할 이메일을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 (로그인 문제 해결용)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleCheckUser}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? '확인 중...' : '사용자 확인'}
              </button>
              
              <button
                onClick={handleMakeAdmin}
                disabled={loading || !userInfo}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {loading ? '설정 중...' : '관리자로 설정'}
              </button>
              
              <button
                onClick={handleResetPassword}
                disabled={loading || !userInfo}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('✅') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {userInfo && (
              <div className="p-4 bg-blue-100 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">사용자 정보:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div><strong>ID:</strong> {userInfo.id}</div>
                  <div><strong>이메일:</strong> {userInfo.email}</div>
                  <div><strong>이름:</strong> {userInfo.name}</div>
                  <div><strong>관리자:</strong> {userInfo.isAdmin ? '✅ 예' : '❌ 아니오'}</div>
                  <div><strong>승인상태:</strong> {userInfo.isApproved ? '✅ 승인됨' : '❌ 대기중'}</div>
                  <div><strong>가입일:</strong> {new Date(userInfo.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-yellow-100 rounded-md">
            <h3 className="font-medium text-yellow-800 mb-2">사용법:</h3>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>관리자로 설정할 이메일 주소를 입력하세요</li>
              <li><strong>"사용자 확인"</strong> 버튼을 먼저 클릭해서 계정이 존재하는지 확인하세요</li>
              <li>사용자 정보가 표시되면 <strong>"관리자로 설정"</strong> 버튼을 클릭하세요</li>
              <li><strong>로그인 문제가 있다면:</strong> 새 비밀번호를 입력하고 <strong>"비밀번호 변경"</strong> 버튼을 클릭하세요</li>
              <li>성공 메시지가 나타나면 완료입니다</li>
              <li>해당 계정으로 로그인하면 관리자 메뉴가 보입니다</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}
