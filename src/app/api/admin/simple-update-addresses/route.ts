import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 간단한 주소 매핑으로 직접 업데이트
    const updates = [
      // 서울 지역들
      { lat: 37.5665, lng: 126.9780, address: '서울특별시 중구' },
      { lat: 37.5519, lng: 126.9918, address: '서울특별시 강남구' },
      { lat: 37.4979, lng: 127.0276, address: '서울특별시 서초구' },
      { lat: 37.5563, lng: 126.9723, address: '서울특별시 종로구' },
      { lat: 37.5326, lng: 127.0244, address: '서울특별시 송파구' },
      { lat: 37.4728, lng: 126.9450, address: '서울특별시 관악구' },
      // 부산 지역
      { lat: 35.1796, lng: 129.0756, address: '부산광역시 해운대구' },
      { lat: 35.1595, lng: 129.0598, address: '부산광역시 수영구' },
      // 대구 지역
      { lat: 35.8714, lng: 128.6014, address: '대구광역시 중구' },
      // 인천 지역
      { lat: 37.4563, lng: 126.7052, address: '인천광역시 연수구' },
      // 대전 지역
      { lat: 36.3504, lng: 127.3845, address: '대전광역시 유성구' },
      // 광주 지역
      { lat: 35.1595, lng: 126.8526, address: '광주광역시 남구' }
    ]

    let updatedCount = 0

    for (const update of updates) {
      // 해당 좌표에 가까운 사용자들 찾기 (소수점 2자리까지 일치 - 더 넓은 범위)
      const result = await prisma.$executeRaw`
        UPDATE users 
        SET address = ${update.address}
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL 
        AND ABS(latitude - ${update.lat}) < 0.01
        AND ABS(longitude - ${update.lng}) < 0.01
        AND (address LIKE '%위도:%' OR address = '대한민국')
      `
      
      updatedCount += Number(result)
      console.log(`${update.address}: ${result}명 업데이트`)
    }

    // 나머지 위도/경도 형태 주소들을 일반적인 주소로 변경
    const remainingResult = await prisma.$executeRaw`
      UPDATE users 
      SET address = '대한민국'
      WHERE address LIKE '%위도:%'
    `
    
    updatedCount += Number(remainingResult)
    console.log(`나머지 사용자: ${remainingResult}명 업데이트`)

    return NextResponse.json({
      success: true,
      message: `총 ${updatedCount}명의 사용자 주소가 업데이트되었습니다.`,
      updatedCount
    })
  } catch (error: any) {
    console.error('주소 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: `주소 업데이트 중 오류: ${error.message}` },
      { status: 500 }
    )
  }
}
