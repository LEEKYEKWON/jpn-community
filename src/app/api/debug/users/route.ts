import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 모든 사용자의 기본 정보와 위치 정보 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        latitude: true,
        longitude: true,
        address: true,
        isAdmin: true,
        isApproved: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 통계 정보
    const stats = {
      totalUsers: users.length,
      usersWithLocation: users.filter(u => u.latitude && u.longitude).length,
      admins: users.filter(u => u.isAdmin).length,
      approved: users.filter(u => u.isApproved).length,
    }

    return NextResponse.json({
      success: true,
      stats,
      users
    })
  } catch (error: any) {
    console.error('사용자 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: `사용자 조회 중 오류: ${error.message}` },
      { status: 500 }
    )
  }
}
