import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('SQL 직접 주소 업데이트 시작...')

    // 1단계: 모든 사용자 조회 (RAW SQL)
    const users = await prisma.$queryRaw`
      SELECT id, name, latitude, longitude, address 
      FROM users 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    ` as Array<{
      id: string
      name: string
      latitude: number
      longitude: number
      address: string
    }>

    console.log(`총 ${users.length}명의 사용자 발견`)

    // 2단계: 주소 매핑 함수
    const getAddressForCoords = (lat: number, lng: number): string => {
      const mappings = [
        // 서울 (북부)
        { lat: 37.6, lng: 127.0, address: '서울특별시 북부' },
        // 서울 (남부) 
        { lat: 37.5, lng: 127.0, address: '서울특별시 남부' },
        // 인천/경기 서부
        { lat: 37.4563, lng: 126.7052, address: '인천광역시' },
        { lat: 37.2, lng: 126.8, address: '경기도 서부' },
        // 경기 동부
        { lat: 37.3, lng: 127.2, address: '경기도 동부' },
        { lat: 37.0, lng: 127.3, address: '경기도 남부' },
        // 강원도
        { lat: 37.8, lng: 128.5, address: '강원도' },
        // 충청북도
        { lat: 36.8, lng: 127.7, address: '충청북도' },
        // 대전/충청남도
        { lat: 36.3504, lng: 127.3845, address: '대전광역시' },
        { lat: 36.5, lng: 126.8, address: '충청남도' },
        // 전라북도
        { lat: 35.8, lng: 127.1, address: '전라북도' },
        // 광주/전라남도  
        { lat: 35.1595, lng: 126.8526, address: '광주광역시' },
        { lat: 34.8, lng: 126.4, address: '전라남도' },
        // 대구/경상북도
        { lat: 35.8714, lng: 128.6014, address: '대구광역시' },
        { lat: 36.4, lng: 128.8, address: '경상북도' },
        // 부산/경상남도
        { lat: 35.1796, lng: 129.0756, address: '부산광역시' },
        { lat: 35.2, lng: 128.1, address: '경상남도' },
        // 울산
        { lat: 35.5, lng: 129.3, address: '울산광역시' },
        // 제주도
        { lat: 33.5, lng: 126.5, address: '제주특별자치도' }
      ]

      let closestAddress = '서울특별시'
      let minDistance = Infinity

      for (const mapping of mappings) {
        const distance = Math.abs(lat - mapping.lat) + Math.abs(lng - mapping.lng)
        if (distance < minDistance) {
          minDistance = distance
          closestAddress = mapping.address
        }
      }

      // 한국 내 좌표인지 확인 (위도 33-39, 경도 124-132)
      const isInKorea = lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132
      
      if (isInKorea) {
        return closestAddress
      } else {
        return `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`
      }
    }

    // 3단계: 각 사용자별로 직접 SQL 업데이트
    let updateCount = 0
    const updates: string[] = []

    for (const user of users) {
      const newAddress = getAddressForCoords(user.latitude, user.longitude)
      
      if (user.address !== newAddress) {
        // 직접 SQL UPDATE 실행
        await prisma.$executeRaw`
          UPDATE users 
          SET address = ${newAddress} 
          WHERE id = ${user.id}
        `
        
        updates.push(`${user.name}: ${user.address} → ${newAddress}`)
        updateCount++
      }
    }

    console.log('업데이트 완료:', updates)

    return NextResponse.json({
      success: true,
      message: `총 ${updateCount}명의 사용자 주소가 업데이트되었습니다.`,
      details: {
        totalUsers: users.length,
        updatedUsers: updateCount,
        updates: updates
      }
    })

  } catch (error: any) {
    console.error('SQL 주소 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: `오류 발생: ${error.message}` },
      { status: 500 }
    )
  }
}
