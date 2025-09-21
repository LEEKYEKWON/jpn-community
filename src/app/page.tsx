'use client'

import { useState, useEffect, useRef } from 'react'
import Navigation from '@/components/Navigation'
import NaverMap from '@/components/NaverMap'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  name: string
  bio?: string
  latitude: number
  longitude: number
  address?: string
  birthDate?: string
  origin?: string
}

export default function Home() {
  const { user, refreshUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null)
  const registerFormRef = useRef<HTMLDivElement>(null)
  const listContainerRef = useRef<HTMLDivElement>(null)
  const userListRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [loading, setLoading] = useState(true)
  
  // 자기소개 등록 관련 상태
  const [isRegistering, setIsRegistering] = useState(false)
  const [tempLocation, setTempLocation] = useState<{lat: number, lng: number} | null>(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false) // 위치만 변경
  const [isEditingProfile, setIsEditingProfile] = useState(false) // 프로필 변경
  const [registerForm, setRegisterForm] = useState({
    name: '',
    birthDate: '',
    origin: '',
    bio: ''
  })

  // 사용자 목록 가져오기
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        const filteredUsers = data.filter((u: User) => u.latitude && u.longitude)
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error)
      // 데이터베이스 연결 실패 시 빈 배열로 설정
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser)
    setHighlightedUserId(selectedUser.id)
    
    // 리스트 컨테이너 내에서만 스크롤
    setTimeout(() => {
      const userElement = userListRefs.current[selectedUser.id]
      const listContainer = listContainerRef.current
      
      if (userElement && listContainer) {
        // 컨테이너와 요소의 위치 계산
        const containerRect = listContainer.getBoundingClientRect()
        const elementRect = userElement.getBoundingClientRect()
        
        // 컨테이너 내에서의 상대적 위치 계산
        const relativeTop = elementRect.top - containerRect.top + listContainer.scrollTop
        const containerHeight = listContainer.clientHeight
        const elementHeight = userElement.offsetHeight
        
        // 요소가 컨테이너 중앙에 오도록 스크롤 위치 계산
        const scrollTop = relativeTop - (containerHeight / 2) + (elementHeight / 2)
        
        // 부드러운 스크롤
        listContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }
    }, 100) // 상태 업데이트 후 스크롤
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setHighlightedUserId(user.id)
  }

  // 자기소개 등록 시작
  const handleStartRegister = () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    setIsRegistering(true)
    setTempLocation(null)
    setShowRegisterForm(false)
  }

  // 위도/경도 표시로 되돌림
  const getAddressFromCoords = (lat: number, lng: number): Promise<string> => {
    console.log('getAddressFromCoords 호출:', lat, lng) // 디버깅
    return new Promise((resolve) => {
      // 간단하게 위도/경도로 표시
      const address = `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`
      console.log('주소 결과:', address) // 디버깅
      resolve(address)
    })
  }

  // 지도에서 위치 선택
  const handleLocationSelect = (lat: number, lng: number) => {
    setTempLocation({ lat, lng })
    setShowRegisterForm(false) // 바로 폼을 열지 않고 "여기에 등록하기" 버튼만 표시
  }

  // 자기소개 등록/프로필 변경 폼 제출
  const handleRegisterSubmit = async () => {
    if (!user) return

    // 프로필 변경 모드인 경우 tempLocation 체크 안함
    if (!isEditingProfile && !tempLocation) return

    try {
      const requestData = {
        userId: user.id,
        bio: registerForm.bio,
        name: registerForm.name,
        birthDate: registerForm.birthDate,
        origin: registerForm.origin
      }

      // 새로 등록하는 경우에만 위치 정보 추가
      if (!isEditingProfile && tempLocation) {
        requestData.latitude = tempLocation.lat
        requestData.longitude = tempLocation.lng
        // 실제 주소 가져오기
        requestData.address = await getAddressFromCoords(tempLocation.lat, tempLocation.lng)
      }

      console.log('전송할 데이터:', requestData) // 디버깅용

      const response = await fetch('/api/auth/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      console.log('응답:', data) // 디버깅용

      if (data.success) {
        if (isEditingProfile) {
          alert('プロフィールが変更されました！')
        } else {
          alert('自己紹介が登録されました！')
        }
        
        // 사용자 정보 새로고침
        await refreshUser()
        
        setIsRegistering(false)
        setIsEditingProfile(false)
        setTempLocation(null)
        setShowRegisterForm(false)
        setRegisterForm({ name: '', birthDate: '', origin: '', bio: '' })
        fetchUsers() // 사용자 목록 새로고침
      } else {
        console.error('실패:', data.message) // 디버깅용
        alert(`${isEditingProfile ? 'プロフィール変更' : '登録'}に失敗しました: ${data.message || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('오류:', error) // 디버깅용
      alert(`${isEditingProfile ? 'プロフィール変更' : '登録'} 중에 오류가 발생했습니다.`)
    }
  }

  // 자기소개 등록 취소
  const handleCancelRegister = () => {
    setIsRegistering(false)
    setIsEditingLocation(false)
    setIsEditingProfile(false)
    setTempLocation(null)
    setShowRegisterForm(false)
    setRegisterForm({ name: '', age: '', origin: '', bio: '' })
  }

  // 위치만 변경 시작
  const handleEditLocationOnly = () => {
    if (!user) return
    setIsEditingLocation(true)
    setTempLocation(null)
    setSelectedUser(null)
  }

  // 프로필 변경 시작
  const handleEditProfile = async () => {
    if (!user) return
    
    // 사용자 정보 새로고침
    await refreshUser()
    
    console.log('프로필 수정 - 현재 사용자 정보:', user) // 디버깅
    
    // 기존 정보로 폼 초기화
    const initialForm = {
      name: user.name || '',
      birthDate: user.birthDate || '',
      origin: user.origin || '',
      bio: user.bio || ''
    }
    
    console.log('프로필 수정 - 초기화될 폼:', initialForm) // 디버깅
    
    setRegisterForm(initialForm)
    setIsEditingProfile(true)
    setShowRegisterForm(true)
    setSelectedUser(null)
    setIsRegistering(false) // 다른 모드 비활성화
    setIsEditingLocation(false)
  }

  // 위치만 업데이트
  const handleLocationUpdate = async () => {
    if (!user || !tempLocation) return
    
    try {
      // 실제 주소 가져오기
      const address = await getAddressFromCoords(tempLocation.lat, tempLocation.lng)
      
      const response = await fetch('/api/auth/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          latitude: tempLocation.lat,
          longitude: tempLocation.lng,
          address: address,
          bio: user.bio // 기존 bio 유지
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('위치가 변경되었습니다!')
        
        // 사용자 정보 직접 업데이트 (API 응답 데이터 사용)
        if (data.user) {
          // AuthContext의 사용자 정보 업데이트
          localStorage.setItem('user', JSON.stringify(data.user))
          // 사용자 정보 새로고침
          await refreshUser()
        }
        
        setIsEditingLocation(false)
        setTempLocation(null)
        fetchUsers() // 사용자 목록 새로고침
      } else {
        alert('위치 변경에 실패했습니다.')
      }
    } catch (error) {
      alert('위치 변경 중 오류가 발생했습니다.')
    }
  }

  // 위치 삭제
  const handleDeleteLocation = async () => {
    if (!user) return
    
    if (confirm('위치를 삭제하시겠습니까?')) {
      try {
        const response = await fetch('/api/auth/update-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            latitude: null,
            longitude: null,
            address: null,
            bio: user.bio,
            name: user.name,
            birthDate: user.birthDate,
            origin: user.origin
          }),
        })

        const data = await response.json()

        if (data.success) {
          alert('위치가 삭제되었습니다.')
          
          // 사용자 정보 새로고침
          await refreshUser()
          
          fetchUsers() // 사용자 목록 새로고침
        } else {
          alert('삭제에 실패했습니다.')
        }
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            日本人妻のコミュニティ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            韓国に住んでいる日本人の奥様のための温かいコミュニティです。
            地図で他の会員と出会い、情報を共有しましょう。
          </p>
        </div>

        {/* 지도와 리스트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 지도 영역 (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4 h-96 lg:h-[600px] overflow-hidden relative">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                会員位置地図
              </h2>

              {/* 자기소개 등록 버튼 */}
              {!isRegistering && !user?.bio && (
                <div className="absolute top-2 right-4 z-10">
                  <button
                    onClick={handleStartRegister}
                    className="bg-pink-500 text-white px-3 py-1.5 text-sm rounded-lg shadow-lg hover:bg-pink-600 transition-colors"
                  >
                    自己紹介登録
                  </button>
                </div>
              )}

              {/* 등록/수정 안내문구 */}
              {(isRegistering || isEditingLocation) && !showRegisterForm && (
                <div className="absolute top-4 left-4 right-4 z-10 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 font-medium mb-2">
                    📍 {isEditingLocation ? '新しい位置をクリックしてください' : '地図上で自分の位置を見つけてクリックしてください'}
                  </div>
                  <button
                    onClick={handleCancelRegister}
                    className="text-blue-600 text-sm underline hover:text-blue-800"
                  >
                    キャンセル
                  </button>
                </div>
              )}

              <div className="h-[calc(100%-2rem)] -mt-2">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">地図を読み込み中...</div>
                  </div>
                ) : (
                  <NaverMap
                    users={users}
                    onUserSelect={handleUserSelect}
                    selectedUserId={highlightedUserId}
                    isSelectMode={(isRegistering || isEditingLocation) && !showRegisterForm}
                    onLocationSelect={handleLocationSelect}
                    tempLocation={tempLocation}
                  />
                )}
              </div>

            </div>

            {/* 여기에 등록하기/위치변경 버튼 - 지도 아래쪽 */}
            {tempLocation && !showRegisterForm && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    if (isEditingLocation) {
                      // 위치만 변경하는 경우
                      handleLocationUpdate()
                    } else {
                      // 새로 등록하는 경우
                      setShowRegisterForm(true)
                      // 입력폼이 보이도록 스크롤
                      setTimeout(() => {
                        registerFormRef.current?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        })
                      }, 100) // 폼이 렌더링된 후 스크롤
                    }
                  }}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-600 transition-colors font-medium"
                >
                  {isEditingLocation ? 'ここに変更する' : 'ここに登録する'}
                </button>
              </div>
            )}

            {/* 자기소개 등록/수정 폼 - 지도 아래쪽 인라인 */}
            {showRegisterForm && (
              <div ref={registerFormRef} className="mt-4 bg-white rounded-lg shadow-lg p-6 border">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {isEditingProfile ? 'プロフィール変更' : '自己紹介登録'}
                </h3>
                
                <form onSubmit={(e) => { e.preventDefault(); handleRegisterSubmit(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        名前 *
                      </label>
                      <input
                        type="text"
                        required
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="お名前を入力してください"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        生年月日
                      </label>
                      <input
                        type="date"
                        value={registerForm.birthDate}
                        onChange={(e) => setRegisterForm({...registerForm, birthDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="生年月日を選択してください"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        出身地
                      </label>
                      <input
                        type="text"
                        value={registerForm.origin}
                        onChange={(e) => setRegisterForm({...registerForm, origin: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                        placeholder="出身地を入力してください"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      自己紹介 *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={registerForm.bio}
                      onChange={(e) => setRegisterForm({...registerForm, bio: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                      placeholder="簡単な自己紹介を書いてください"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelRegister}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* 회원 리스트 영역 (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4 h-96 lg:h-[600px] overflow-hidden">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                会員紹介
              </h2>
              <div ref={listContainerRef} className="overflow-y-auto h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">読み込み中...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    まだ登録された会員がいません。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((userData) => (
                      <div
                        key={userData.id}
                        ref={(el) => {
                          userListRefs.current[userData.id] = el
                        }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          highlightedUserId === userData.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleUserClick(userData)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                            {userData.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {userData.name}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {userData.birthDate ? (
                                <p className="truncate">🎂 {userData.birthDate}</p>
                              ) : (
                                <p className="truncate text-gray-400">🎂 生年月日未設定</p>
                              )}
                              {userData.origin ? (
                                <p className="truncate">🌍 {userData.origin}</p>
                              ) : (
                                <p className="truncate text-gray-400">🌍 出身地未設定</p>
                              )}
                            </div>
                            {userData.bio && (
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                                {userData.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 선택된 사용자 상세 정보 */}
        {selectedUser && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-semibold text-gray-900">
                {selectedUser.name}さんのプロフィール
              </h3>
              {user && user.id === selectedUser.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleEditLocationOnly}
                    className="bg-green-500 text-white px-3 py-1.5 text-sm rounded-lg shadow hover:bg-green-600 transition-colors"
                  >
                    位置変更
                  </button>
                  <button
                    onClick={handleEditProfile}
                    className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg shadow hover:bg-blue-600 transition-colors"
                  >
                    プロフィール変更
                  </button>
                  <button
                    onClick={handleDeleteLocation}
                    className="bg-red-500 text-white px-3 py-1.5 text-sm rounded-lg shadow hover:bg-red-600 transition-colors"
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">基本情報</h4>
                <div className="space-y-2">
                  {/* 스키마 충돌로 임시 제거
                  {selectedUser.birthDate && (
                    <div><span className="font-medium text-gray-600">生年月日:</span> {selectedUser.birthDate}</div>
                  )}
                  {selectedUser.origin && (
                    <div><span className="font-medium text-gray-600">出身地:</span> {selectedUser.origin}</div>
                  )}
                  */}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">生年月日</h4>
                  <p className="text-gray-600">
                    {selectedUser.birthDate ? `🎂 ${selectedUser.birthDate}` : '🎂 未設定'}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">出身地</h4>
                  <p className="text-gray-600">
                    {selectedUser.origin ? `🌍 ${selectedUser.origin}` : '🌍 未設定'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-medium text-gray-700 mb-2">自己紹介</h4>
              <p className="text-gray-600 leading-relaxed">
                {selectedUser.bio || '自己紹介がありません。'}
              </p>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        {!user && (
          <div className="mt-8 bg-pink-100 border border-pink-300 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">
              会員登録して地図に登録してみてください！
            </h3>
            <p className="text-pink-700 mb-4">
              会員登録後、位置を登録すると他の会員と交流できます。
            </p>
            <div className="space-x-4">
              <a
                href="/register"
                className="inline-block bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors"
              >
                会員登録
          </a>
          <a
                href="/login"
                className="inline-block bg-white text-pink-500 border border-pink-500 px-6 py-2 rounded-md hover:bg-pink-50 transition-colors"
              >
                ログイン
          </a>
        </div>
          </div>
        )}

      </main>
    </div>
  )
}