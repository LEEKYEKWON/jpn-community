import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 실제 구현에서는 JWT 토큰이나 세션에서 사용자 ID를 가져와야 합니다
    // 여기서는 간단히 쿼리 파라미터로 받습니다
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // SQL 직접 사용으로 스키마 문제 우회
    const users = await prisma.$queryRaw`
      SELECT id, email, name, bio, "birthDate", origin, latitude, longitude, address, "isAdmin", "isApproved"
      FROM users 
      WHERE id = ${userId}
    ` as Array<{
      id: string
      email: string
      name: string
      bio: string | null
      birthDate: string | null
      origin: string | null
      latitude: number | null
      longitude: number | null
      address: string | null
      isAdmin: boolean
      isApproved: boolean
    }>
    
    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { success: false, message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '사용자 정보 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


