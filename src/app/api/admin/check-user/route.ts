import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: '이메일이 필요합니다' },
        { status: 400 }
      )
    }

    // 해당 이메일의 사용자 정보 조회 (문제가 되는 필드 제외)
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isApproved: true,
        createdAt: true
      }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: `${email} 계정을 찾을 수 없습니다.`
      })
    }

    return NextResponse.json({
      success: true,
      message: `${email} 계정을 찾았습니다.`,
      user: user
    })
  } catch (error: any) {
    console.error('사용자 조회 오류:', error)
    
    return NextResponse.json(
      { success: false, message: `사용자 조회 중 오류: ${error.message}` },
      { status: 500 }
    )
  }
}
