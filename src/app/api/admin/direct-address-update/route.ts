import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('직접 주소 업데이트 시작...')

    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        address: true
      }
    })

    console.log(`총 ${users.length}명의 사용자 발견`)

    // 주소 매핑
    const getAddressForCoords = (lat: number, lng: number): string => {
      const mappings = [
        { lat: 37.5665, lng: 126.9780, address: '서울특별시 중구' },
        { lat: 37.5519, lng: 126.9918, address: '서울특별시 강남구' },
        { lat: 37.4979, lng: 127.0276, address: '서울특별시 서초구' },
        { lat: 37.5563, lng: 126.9723, address: '서울특별시 종로구' },
        { lat: 37.5326, lng: 127.0244, address: '서울특별시 송파구' },
        { lat: 37.4728, lng: 126.9450, address: '서울특별시 관악구' },
        { lat: 35.1796, lng: 129.0756, address: '부산광역시 해운대구' },
        { lat: 35.1595, lng: 129.0598, address: '부산광역시 수영구' },
        { lat: 35.8714, lng: 128.6014, address: '대구광역시 중구' },
        { lat: 37.4563, lng: 126.7052, address: '인천광역시 연수구' },
        { lat: 36.3504, lng: 127.3845, address: '대전광역시 유성구' },
        { lat: 35.1595, lng: 126.8526, address: '광주광역시 남구' }
      ]

      // 가장 가까운 주소 찾기
      let closestAddress = '서울특별시'
      let minDistance = Infinity

      for (const mapping of mappings) {
        const distance = Math.abs(lat - mapping.lat) + Math.abs(lng - mapping.lng)
        if (distance < minDistance) {
          minDistance = distance
          closestAddress = mapping.address
        }
      }

      return closestAddress
    }

    let updateCount = 0

    // 각 사용자 처리
    for (const user of users) {
      if (user.latitude && user.longitude) {
        const newAddress = getAddressForCoords(user.latitude, user.longitude)
        
        if (user.address !== newAddress) {
          await prisma.user.update({
            where: { id: user.id },
            data: { address: newAddress }
          })
          
          console.log(`${user.name}: ${user.address} → ${newAddress}`)
          updateCount++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `총 ${updateCount}명의 사용자 주소가 업데이트되었습니다.`,
      totalUsers: users.length,
      updatedUsers: updateCount
    })

  } catch (error: any) {
    console.error('주소 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: `오류 발생: ${error.message}` },
      { status: 500 }
    )
  }
}
