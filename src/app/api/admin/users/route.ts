import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인은 클라이언트에서 처리
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        // birthDate: true, // 스키마 충돌로 임시 제외
        // origin: true,    // 스키마 충돌로 임시 제외
        latitude: true,
        longitude: true,
        address: true,
        isAdmin: true,
        isApproved: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('관리자 사용자 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '사용자 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
