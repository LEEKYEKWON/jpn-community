import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('모든 주소를 위도/경도로 통일 시작...')

    // 위치 정보가 있는 모든 사용자 조회
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

    let updateCount = 0
    const updates: string[] = []

    // 각 사용자의 주소를 위도/경도 형태로 변경
    for (const user of users) {
      const newAddress = `위도: ${user.latitude.toFixed(4)}, 경도: ${user.longitude.toFixed(4)}`
      
      if (user.address !== newAddress) {
        // SQL로 직접 업데이트
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
      message: `총 ${updateCount}명의 사용자 주소가 위도/경도로 통일되었습니다.`,
      details: {
        totalUsers: users.length,
        updatedUsers: updateCount,
        updates: updates
      }
    })

  } catch (error: any) {
    console.error('주소 통일 오류:', error)
    return NextResponse.json(
      { success: false, message: `오류 발생: ${error.message}` },
      { status: 500 }
    )
  }
}
