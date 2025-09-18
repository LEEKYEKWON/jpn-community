import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 위도/경도 형태의 주소를 가진 사용자들 조회
    const users = await prisma.user.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        address: {
          contains: '위도:'
        }
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        address: true,
        name: true
      }
    })

    console.log(`${users.length}명의 사용자 주소를 업데이트합니다.`)

    // 간단한 주소 매핑 (실제 좌표에 기반한 추정)
    const addressMap: { [key: string]: string } = {
      // 서울 지역
      '37.5665_126.9780': '서울특별시 중구',
      '37.5519_126.9918': '서울특별시 강남구', 
      '37.4979_127.0276': '서울특별시 서초구',
      // 부산 지역
      '35.1796_129.0756': '부산광역시 해운대구',
      // 대구 지역  
      '35.8714_128.6014': '대구광역시 중구',
      // 인천 지역
      '37.4563_126.7052': '인천광역시 연수구'
    }

    let updatedCount = 0

    for (const user of users) {
      const lat = user.latitude!
      const lng = user.longitude!
      
      // 좌표를 키로 변환 (소수점 4자리까지)
      const coordKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`
      
      let newAddress = addressMap[coordKey]
      
      if (!newAddress) {
        // 매핑에 없는 경우 지역별로 추정
        if (lat >= 37.4 && lat <= 37.7 && lng >= 126.8 && lng <= 127.2) {
          if (lng < 127.0) {
            newAddress = '서울특별시 서부'
          } else {
            newAddress = '서울특별시 강남구'
          }
        } else if (lat >= 35.0 && lat <= 35.3 && lng >= 128.9 && lng <= 129.3) {
          newAddress = '부산광역시'
        } else if (lat >= 35.7 && lat <= 36.0 && lng >= 128.4 && lng <= 128.8) {
          newAddress = '대구광역시'
        } else if (lat >= 37.3 && lat <= 37.6 && lng >= 126.5 && lng <= 126.9) {
          newAddress = '인천광역시'
        } else {
          // 기본값
          newAddress = '대한민국'
        }
      }

      // 주소 업데이트 (스키마 문제 회피)
      await prisma.user.update({
        where: { id: user.id },
        data: { address: newAddress },
        select: {
          id: true,
          name: true,
          address: true
        }
      })

      updatedCount++
      console.log(`${user.name}: ${user.address} → ${newAddress}`)
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount}명의 사용자 주소가 업데이트되었습니다.`,
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
