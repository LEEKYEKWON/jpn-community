import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()
    
    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, message: '이메일과 새 비밀번호가 필요합니다' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // 해당 이메일의 사용자 비밀번호 변경
    const user = await prisma.user.update({
      where: { email: email },
      data: { 
        password: hashedPassword,
        isApproved: true  // 승인도 함께 설정
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
      message: `${email} 계정의 비밀번호가 변경되었습니다.`,
      user: user
    })
  } catch (error: any) {
    console.error('비밀번호 변경 오류:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: '해당 이메일의 계정을 찾을 수 없습니다' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: `비밀번호 변경 중 오류: ${error.message}` },
      { status: 500 }
    )
  }
}
