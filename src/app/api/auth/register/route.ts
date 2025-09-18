import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, bio } = await request.json()
    console.log('회원가입 요청:', { email, name, password: '***', bio })

    // 입력 검증
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, message: '필수 정보를 모두 입력해주세요' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 6자 이상이어야 합니다' },
        { status: 400 }
      )
    }

    // 이메일 중복 확인 (SQL 직접 사용)
    console.log('이메일 중복 확인 시작:', email) // 디버깅
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM users WHERE email = ${email}
    ` as Array<{ id: string }>

    if (existingUsers.length > 0) {
      console.log('이미 존재하는 이메일:', email) // 디버깅
      return NextResponse.json(
        { success: false, message: '이미 사용 중인 이메일입니다' },
        { status: 400 }
      )
    }
    console.log('이메일 중복 확인 완료 - 사용 가능') // 디버깅

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 12)

    // 고유 ID 생성
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    console.log('생성할 사용자 ID:', userId) // 디버깅
    
    // 필수 컬럼만으로 사용자 생성 시도
    console.log('데이터베이스에 사용자 생성 시작') // 디버깅
    
    try {
      // 기본값을 사용하기 위해 불리언 컬럼은 생략 ("isAdmin"=false, "isApproved"=true)
      await prisma.$executeRaw`
        INSERT INTO "users" (id, email, name, password, "createdAt", "updatedAt")
        VALUES (${userId}, ${email}, ${name}, ${hashedPassword}, NOW(), NOW())
      `
      console.log('필수 컬럼으로 사용자 생성 완료') // 디버깅
      
      // bio가 있으면 별도로 업데이트
      if (bio) {
        await prisma.$executeRaw`
          UPDATE "users" SET bio = ${bio}, "updatedAt" = NOW() WHERE id = ${userId}
        `
        console.log('bio 업데이트 완료') // 디버깅
      }
    } catch (insertError: any) {
      console.error('INSERT 오류:', insertError)
      throw insertError
    }
    
    // 생성된 사용자 정보 조회
    const users = await prisma.$queryRaw`
      SELECT id, email, name, bio, "isAdmin", "isApproved"
      FROM "users" 
      WHERE id = ${userId}
    ` as Array<{
      id: string
      email: string
      name: string
      bio: string | null
      isAdmin: boolean
      isApproved: boolean
    }>
    
    const user = users[0]

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다',
      user,
    })
  } catch (error: any) {
    console.error('회원가입 오류 상세:', error)
    console.error('오류 메시지:', error.message)
    console.error('오류 스택:', error.stack)
    console.error('오류 코드:', error.code)
    
    let errorMessage = '회원가입 중 오류가 발생했습니다'
    
    if (error.code === 'P2002') {
      errorMessage = '이미 사용중인 이메일입니다'
    } else if (error.message) {
      errorMessage = `오류: ${error.message}`
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.message,
        code: error.code 
      },
      { status: 500 }
    )
  }
}


