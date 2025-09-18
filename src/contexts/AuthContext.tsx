'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  bio?: string
  birthDate?: string
  origin?: string
  latitude?: number
  longitude?: number
  address?: string
  isAdmin: boolean
  isApproved: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (data: {
    email: string
    name: string
    password: string
    bio?: string
  }) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateLocation: (latitude: number, longitude: number, address: string) => Promise<void>
  refreshUser: () => Promise<void>
  deleteAccount: () => Promise<{ success: boolean; message: string }>
  canWrite: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 사용자 정보 확인
    const savedUser = localStorage.getItem('jpn_user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error)
        localStorage.removeItem('jpn_user')
      }
    }
    setLoading(false)
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('사용자 확인 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('jpn_user', JSON.stringify(data.user))
        return { success: true, message: '로그인 성공' }
      } else {
        return { success: false, message: data.message || '로그인 실패' }
      }
    } catch (error) {
      return { success: false, message: '로그인 중 오류가 발생했습니다' }
    }
  }

  const register = async (data: {
    email: string
    name: string
    password: string
    bio?: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.user)
        // 로컬 스토리지에 사용자 정보 저장
        localStorage.setItem('jpn_user', JSON.stringify(result.user))
        return { success: true, message: '회원가입 성공' }
      } else {
        return { success: false, message: result.message || '회원가입 실패' }
      }
    } catch (error) {
      return { success: false, message: '회원가입 중 오류가 발생했습니다' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      // 로컬 스토리지에서 사용자 정보 제거
      localStorage.removeItem('jpn_user')
    } catch (error) {
      console.error('로그아웃 실패:', error)
      // 오류가 발생해도 로컬 스토리지는 정리
      setUser(null)
      localStorage.removeItem('jpn_user')
    }
  }

  const deleteAccount = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: '로그인이 필요합니다' }
    }

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (data.success) {
        // 로컬 상태 정리
        setUser(null)
        localStorage.removeItem('jpn_user')
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      return { success: false, message: '회원탈퇴 중 오류가 발생했습니다' }
    }
  }

  const updateLocation = async (latitude: number, longitude: number, address: string) => {
    try {
      const response = await fetch('/api/auth/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, address }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUser(result.user)
          // 로컬 스토리지도 업데이트
          localStorage.setItem('jpn_user', JSON.stringify(result.user))
        }
      }
    } catch (error) {
      console.error('위치 업데이트 실패:', error)
    }
  }

  // 사용자 정보 새로고침 함수 추가
  const refreshUser = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/auth/me?userId=${user.id}`)
      if (response.ok) {
        const userData = await response.json()
        console.log('새로고침된 사용자 정보:', userData) // 디버깅용
        setUser(userData)
        localStorage.setItem('jpn_user', JSON.stringify(userData))
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error)
    }
  }

  // 글쓰기 권한 체크 (자기소개 등록한 사용자만)
  const canWrite = user && user.latitude && user.longitude

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateLocation,
      refreshUser,
      deleteAccount,
      canWrite,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


