import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 입력 검증
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    // SQL 직접 사용으로 스키마 문제 우회
    const users = await prisma.$queryRaw`
      SELECT id, email, name, password, bio, birthDate, origin, latitude, longitude, address, isAdmin, isApproved
      FROM users 
      WHERE email = ${email}
    ` as Array<{
      id: string
      email: string
      name: string
      password: string
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
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    // 비밀번호 확인
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    // 승인 상태 확인
    if (!user.isApproved) {
      return NextResponse.json(
        { success: false, message: '아직 승인되지 않은 계정입니다' },
        { status: 403 }
      )
    }

    // 사용자 정보 반환 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: '로그인 성공',
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('로그인 오류:', error)
    console.error('오류 상세:', error.message)
    console.error('오류 스택:', error.stack)
    return NextResponse.json(
      { success: false, message: '로그인 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


