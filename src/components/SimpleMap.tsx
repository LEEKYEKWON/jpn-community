'use client'

import { useEffect, useRef, useState } from 'react'

interface User {
  id: string
  name: string
  bio?: string
  latitude: number
  longitude: number
  address?: string
}

interface SimpleMapProps {
  users: User[]
  onUserSelect?: (user: User) => void
  selectedUserId?: string
}

export default function SimpleMap({ users, onUserSelect, selectedUserId }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    // 간단한 지도 대신 사용자 위치를 표시하는 컴포넌트
    setIsMapLoaded(true)
  }, [])

  if (!isMapLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">지도를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden">
      {/* 간단한 지도 대체 UI */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <div className="text-lg font-semibold text-gray-700 mb-2">회원 위치 지도</div>
          <div className="text-sm text-gray-500">
            회원들의 위치를 확인해보세요
          </div>
        </div>
      </div>

      {/* 사용자 마커 표시 */}
      {users.map((user, index) => (
        <div
          key={user.id}
          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${20 + (index * 15)}%`,
            top: `${30 + (index * 10)}%`,
          }}
          onClick={() => onUserSelect?.(user)}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all ${
              selectedUserId === user.id
                ? 'bg-red-500 scale-110'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {user.name.charAt(0)}
          </div>
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
            {user.name}
          </div>
        </div>
      ))}
    </div>
  )
}
