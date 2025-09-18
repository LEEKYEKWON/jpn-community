'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: '/', label: '自己紹介(地図)', icon: '🏠' },
    { href: '/meet', label: '会いましょう', icon: '👥' },
    { href: '/korea-info', label: '韓国生活情報', icon: '🇰🇷' },
    { href: '/market', label: '譲り/売ります', icon: '🛍️' },
    { href: '/board', label: '何でも掲示板', icon: '💬' },
  ]

  // 현재 경로가 활성 메뉴인지 확인하는 함수
  const isActiveMenu = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">🌸</div>
            <span className="text-xl font-bold text-pink-600">日本人妻のコミュニティ</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => {
              const isActive = isActiveMenu(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 transition-colors text-sm relative ${
                    isActive 
                      ? 'text-pink-600' 
                      : 'text-gray-700 hover:text-pink-600'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-pink-600 rounded-full"></div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">{user.name}</span>
                <Link
                  href="/settings"
                  className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600 transition-colors"
                >
                  設定
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition-colors"
                  >
                    管理者
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-pink-500 text-white px-3 py-1 rounded-md text-sm hover:bg-pink-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-pink-600 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600 transition-colors"
                >
                  会員登録
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-pink-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {menuItems.map((item) => {
                const isActive = isActiveMenu(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 block px-3 py-2 rounded-md text-base font-medium relative ${
                      isActive 
                        ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-600' 
                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              {user ? (
                <div className="pt-4 border-t">
                  <div className="px-3 py-2 text-gray-700 text-sm">
                    {user.name}
                  </div>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    設定
                  </Link>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-red-600 hover:text-red-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      管理者ページ
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600"
                  >
                    ログアウト
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t space-y-2">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    会員登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}


