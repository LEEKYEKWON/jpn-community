'use client'

import { useState } from 'react'
import Navigation from '@/components/Navigation'

export default function UpdateAddressesPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleUpdateAddresses = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/update-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 주소 업데이트 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSimpleUpdateAddresses = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/simple-update-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 주소 업데이트 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDirectUpdateAddresses = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/direct-address-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message} (총 ${data.totalUsers}명 중 ${data.updatedUsers}명 업데이트)`)
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 주소 업데이트 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSqlUpdateAddresses = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/sql-address-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        if (data.details?.updates?.length > 0) {
          setMessage(prev => prev + '\n\n업데이트 내역:\n' + data.details.updates.join('\n'))
        }
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 주소 업데이트 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleResetToCoordinates = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/reset-to-coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`✅ ${data.message}`)
        if (data.details?.updates?.length > 0) {
          setMessage(prev => prev + '\n\n업데이트 내역:\n' + data.details.updates.join('\n'))
        }
      } else {
        setMessage(`❌ ${data.message}`)
      }
    } catch (error) {
      setMessage('❌ 주소 통일 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">주소 정보 업데이트</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-yellow-100 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">작업 내용:</h3>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>기존 "위도: xx.xxx, 경도: xx.xxx" 형태의 주소를 실제 지역명으로 변경</li>
                <li>예: "위도: 37.5665, 경도: 126.9780" → "서울특별시 중구"</li>
                <li>시드 데이터로 생성된 사용자들의 주소가 자동으로 변환됩니다</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleResetToCoordinates}
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-3 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 w-full font-bold"
              >
                {loading ? '통일 중...' : '🔄 모든 주소를 위도/경도로 통일'}
              </button>
              
              <button
                onClick={handleSqlUpdateAddresses}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 w-full font-bold"
              >
                {loading ? '업데이트 중...' : '💜 SQL 직접 업데이트 (스키마 무시)'}
              </button>
              
              <button
                onClick={handleDirectUpdateAddresses}
                disabled={loading}
                className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 w-full"
              >
                {loading ? '업데이트 중...' : '🚀 직접 주소 업데이트 (최신)'}
              </button>
              
              <button
                onClick={handleSimpleUpdateAddresses}
                disabled={loading}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 w-full"
              >
                {loading ? '업데이트 중...' : '🔧 간단 주소 업데이트 (추천)'}
              </button>
              
              <button
                onClick={handleUpdateAddresses}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 w-full"
              >
                {loading ? '업데이트 중...' : '기존 사용자 주소 업데이트'}
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
          </div>
          
          <div className="mt-8 p-4 bg-blue-100 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">참고사항:</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>이 작업은 기존 사용자들의 주소만 업데이트합니다</li>
              <li>새로 등록하는 사용자는 자동으로 실제 주소가 저장됩니다</li>
              <li>작업 후 홈페이지를 새로고침하면 변경된 주소를 확인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
