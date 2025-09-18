import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, isApproved } = await request.json()

    if (!userId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, message: '필수 정보가 누락되었습니다' },
        { status: 400 }
      )
    }

    // 사용자 승인 상태 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved },
      select: {
        id: true,
        name: true,
        email: true,
        isApproved: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: `사용자 승인 상태가 ${isApproved ? '승인' : '취소'}로 변경되었습니다`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('사용자 승인 처리 오류:', error)
    return NextResponse.json(
      { success: false, message: '승인 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
