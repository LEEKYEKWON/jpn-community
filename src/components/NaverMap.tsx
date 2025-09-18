'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface User {
  id: string
  name: string
  bio?: string
  latitude: number
  longitude: number
  address?: string
}

interface NaverMapProps {
  users: User[]
  onUserSelect?: (user: User) => void
  selectedUserId?: string
  onLocationSelect?: (lat: number, lng: number, address: string) => void
  isSelectMode?: boolean
  tempLocation?: { lat: number; lng: number } | null
}

declare global {
  interface Window {
    naver: any
  }
}

export default function NaverMap({ 
  users, 
  onUserSelect, 
  selectedUserId, 
  onLocationSelect,
  isSelectMode = false,
  tempLocation
}: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const { user } = useAuth()
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // 네이버 지도 스크립트 로드
  useEffect(() => {
    console.log('네이버 지도 스크립트 로드 시작') // 디버깅용
    console.log('NAVER_CLIENT_ID:', process.env.NEXT_PUBLIC_NAVER_CLIENT_ID) // 디버깅용
    
    // 인증 실패 확인 함수 설정
    window.navermap_authFailure = function () {
      console.error('네이버 지도 API 인증 실패')
      setIsMapLoaded(false)
    }

    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`
    script.async = true
    script.onload = () => {
      console.log('네이버 지도 스크립트 로드 완료') // 디버깅용
      setIsMapLoaded(true)
    }
    script.onerror = (error) => {
      console.error('네이버 지도 API 로드 실패:', error) // 디버깅용
      setIsMapLoaded(false)
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.naver) return

    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 중심
      zoom: 10,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.naver.maps.MapTypeControlStyle.BUTTON,
        position: window.naver.maps.Position.TOP_RIGHT
      }
    }

    mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions)

    // 위치 선택 모드일 때 클릭 이벤트 추가
    if (isSelectMode) {
      console.log('위치 선택 모드 활성화')
      const clickListener = window.naver.maps.Event.addListener(mapInstance.current, 'click', (e: any) => {
        console.log('지도 클릭됨:', e)
        const lat = e.coord.lat()
        const lng = e.coord.lng()
        console.log('좌표:', { lat, lng })
        
        // 좌표를 주소 형태로 변환하여 전달
        console.log('좌표 전달:', { lat, lng })
        const addressText = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`
        onLocationSelect?.(lat, lng, addressText)
      })
    } else {
      console.log('위치 선택 모드 비활성화')
    }
  }, [isMapLoaded, isSelectMode, onLocationSelect])

  // 마커 생성 및 업데이트
  useEffect(() => {
    
    // 지도가 완전히 로드되지 않았으면 return
    if (!isMapLoaded || !mapInstance.current || !window.naver) {
      return
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []


    // 사용자 마커 생성
    users.forEach((userData) => {
      if (!userData.latitude || !userData.longitude) return

      const position = new window.naver.maps.LatLng(userData.latitude, userData.longitude)
      
      // 커스텀 마커 아이콘 (작은 크기)
      const markerOptions = {
        position,
        map: mapInstance.current,
        icon: {
          content: `
            <div class="custom-marker ${selectedUserId === userData.id ? 'selected' : ''}" 
                 style="
                   width: 28px;
                   height: 28px;
                   background: ${selectedUserId === userData.id ? '#10b981' : '#ec4899'};
                   border: 2px solid white;
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   color: white;
                   font-weight: bold;
                   font-size: 12px;
                   box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                   cursor: pointer;
                   transition: all 0.2s ease;
                 "
                 onmouseover="this.style.transform='scale(1.1)'"
                 onmouseout="this.style.transform='scale(1)'"
            >
              ${userData.name.charAt(0)}
            </div>
          `,
          size: new window.naver.maps.Size(28, 28),
          anchor: new window.naver.maps.Point(14, 14)
        },
        title: userData.name
      }

      const marker = new window.naver.maps.Marker(markerOptions)
      
      // 마커 클릭 이벤트
      window.naver.maps.Event.addListener(marker, 'click', () => {
        onUserSelect?.(userData)
      })

      markersRef.current.push(marker)
    })

    // 임시 마커 생성 (자기소개 등록용)
    if (tempLocation) {
      const position = new window.naver.maps.LatLng(tempLocation.lat, tempLocation.lng)
      
      const tempMarkerOptions = {
        position,
        map: mapInstance.current,
        icon: {
          content: `
            <div style="
              width: 35px;
              height: 35px;
              background: #10b981;
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 3px 8px rgba(0,0,0,0.4);
              cursor: pointer;
              animation: pulse 2s infinite;
            ">
              ✓
            </div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
              }
            </style>
          `,
          size: new window.naver.maps.Size(35, 35),
          anchor: new window.naver.maps.Point(17.5, 17.5)
        },
        title: '선택된 위치'
      }

      const tempMarker = new window.naver.maps.Marker(tempMarkerOptions)
      markersRef.current.push(tempMarker)
    }
  }, [isMapLoaded, users, selectedUserId, onUserSelect, tempLocation])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <div className="text-lg font-semibold text-gray-700 mb-2">회원 위치 지도</div>
            <div className="text-sm text-gray-500 mb-2">
              회원들의 위치를 확인해보세요
            </div>
            <div className="text-xs text-gray-400">
              지도 로딩 중...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


