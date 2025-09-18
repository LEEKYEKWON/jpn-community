'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user, deleteAccount } = useAuth()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await deleteAccount()
      
      if (result.success) {
        alert('회원탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.')
        router.push('/')
      } else {
        alert(`탈퇴 실패: ${result.message}`)
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      alert('회원탈퇴 중 오류가 발생했습니다.')
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-700">로그인이 필요합니다.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">アカウント設定</h1>
          
          {/* 사용자 정보 */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">現在のアカウント情報</h2>
            <div className="space-y-2">
              <p><span className="font-medium">名前:</span> {user.name}</p>
              <p><span className="font-medium">メール:</span> {user.email}</p>
              {user.birthDate && (
                <p><span className="font-medium">生年月日:</span> {user.birthDate}</p>
              )}
              {user.origin && (
                <p><span className="font-medium">出身地:</span> {user.origin}</p>
              )}
              <p><span className="font-medium">位置登録:</span> {user.latitude && user.longitude ? '済み' : '未登録'}</p>
            </div>
          </div>

          {/* 계정 관리 */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">アカウント管理</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-semibold mb-2">⚠️ 危険な操作</h3>
              <p className="text-red-700 mb-4">
                アカウントを削除すると、すべてのデータ（投稿、コメント、プロフィール情報）が完全に削除され、復元できません。
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  アカウント削除
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-800 font-medium">
                    本当にアカウントを削除しますか？この操作は取り消せません。
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? '削除中...' : '確認：削除する'}
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                      className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
