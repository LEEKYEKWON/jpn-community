import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // SQL 직접 사용으로 안정성 확보
    const users = await prisma.$queryRaw`
      SELECT id, name, bio, birthdate, origin, latitude, longitude, address
      FROM users 
      WHERE isApproved = 1 
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
      ORDER BY createdAt DESC
    ` as Array<{
      id: string
      name: string
      bio: string | null
      birthdate: string | null
      origin: string | null
      latitude: number
      longitude: number
      address: string | null
    }>

    return NextResponse.json(users)
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '사용자 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


