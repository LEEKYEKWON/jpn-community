'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import NaverMap from '@/components/NaverMap'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateLocation } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // 프로필 정보
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  
  // 위치 정보
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // 사용자 정보 로드
    setName(user.name || '')
    setBio(user.bio || '')
    setEmail(user.email || '')
    setLatitude(user.latitude || null)
    setLongitude(user.longitude || null)
    setAddress(user.address || '')
  }, [user, router])

  const handleLocationSelect = (lat: number, lng: number, selectedAddress: string) => {
    console.log('위치 선택됨:', { lat, lng, selectedAddress })
    setLatitude(lat)
    setLongitude(lng)
    setAddress(selectedAddress)
    setIsSelectingLocation(false)
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 위치 정보 업데이트
      if (latitude && longitude) {
        const response = await fetch('/api/auth/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            latitude,
            longitude,
            address,
            bio
          }),
        })

        const data = await response.json()

        if (data.success) {
          setSuccess('プロフィールが更新されました！')
          setIsEditing(false)
          // AuthContext 업데이트
          updateLocation(latitude, longitude, address, bio)
        } else {
          setError(data.message || 'プロフィールの更新に失敗しました')
        }
      } else {
        setError('位置を選択してください')
      }
    } catch (error) {
      setError('プロフィールの更新中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pink-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
            <a
              href="/login"
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors"
            >
              ログインする
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors"
            >
              {isEditing ? 'キャンセル' : '編集'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 프로필 정보 */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
                  placeholder="簡単な自己紹介を書いてください"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在の位置
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={address || '位置が選択されていません'}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                  {isEditing && (
                    <button
                      onClick={() => setIsSelectingLocation(!isSelectingLocation)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      {isSelectingLocation ? 'キャンセル' : '位置選択'}
                    </button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading || !latitude || !longitude}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              )}
            </div>

            {/* 지도 영역 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">位置選択</h2>
              
              <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
                <NaverMap
                  users={[]}
                  isSelectMode={isSelectingLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {isSelectingLocation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <strong>位置選択モード</strong><br />
                    地図をクリックして位置を選択してください
                  </div>
                </div>
              )}

              {latitude && longitude && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-700">
                    <strong>選択された位置:</strong><br />
                    緯度: {latitude.toFixed(6)}<br />
                    経度: {longitude.toFixed(6)}<br />
                    住所: {address}
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
