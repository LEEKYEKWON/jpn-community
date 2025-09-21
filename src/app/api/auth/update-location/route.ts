import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, address, userId, bio, birthDate, origin } = await request.json()
    
    console.log('받은 데이터:', { latitude, longitude, address, userId, bio }) // 디버깅용

    // 입력 검증
    if (!userId) {
      console.log('사용자 ID 없음') // 디버깅용
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // SQL 직접 사용으로 스키마 문제 우회
    console.log('SQL 업데이트 시작') // 디버깅용
    if (latitude !== undefined && longitude !== undefined) {
      await prisma.$executeRaw`
        UPDATE users 
        SET latitude = ${latitude}, longitude = ${longitude}, address = ${address}
        WHERE id = ${userId}
      `
    } else if (bio !== undefined || birthDate !== undefined || origin !== undefined) {
      const updates = []
      const values = []
      
      if (bio !== undefined) {
        updates.push('bio = ?')
        values.push(bio)
      }
      if (birthDate !== undefined) {
        updates.push('"birthDate" = ?')
        values.push(birthDate)
      }
      if (origin !== undefined) {
        updates.push('origin = ?')
        values.push(origin)
      }
      
      if (updates.length > 0) {
        await prisma.$executeRawUnsafe(`
          UPDATE users 
          SET ${updates.join(', ')}
          WHERE id = ?
        `, ...values, userId)
      }
    }
    
    // 업데이트된 사용자 정보 조회
    const fullUser = await prisma.$queryRaw`
      SELECT id, email, name, bio, "birthDate", origin, latitude, longitude, address, "isAdmin", "isApproved"
      FROM users 
      WHERE id = ${userId}
    ` as Array<{
      id: string
      email: string
      name: string
      bio: string
      birthDate: string
      origin: string
      latitude: number
      longitude: number
      address: string
      isAdmin: boolean
      isApproved: boolean
    }>
    
    const user = fullUser[0]
    console.log('업데이트된 사용자:', user) // 디버깅용

    return NextResponse.json({
      success: true,
      message: '정보가 업데이트되었습니다',
      user: user,
    })
  } catch (error) {
    console.error('정보 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: `정보 업데이트 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    )
  }
}


