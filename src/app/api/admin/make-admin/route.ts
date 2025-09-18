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

    // 해당 이메일의 사용자를 찾아서 관리자로 설정
    const user = await prisma.user.update({
      where: { email: email },
      data: { 
        isAdmin: true,
        isApproved: true 
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isApproved: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${email} 계정이 관리자로 설정되었습니다.`,
      user: user
    })
  } catch (error: any) {
    console.error('관리자 설정 오류:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: '해당 이메일의 계정을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: `관리자 설정 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    )
  }
}
