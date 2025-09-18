import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    console.log('회원탈퇴 요청:', userId) // 디버깅

    // 사용자 ID 확인
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 사용자 존재 확인
    const users = await prisma.$queryRaw`
      SELECT id, name FROM users WHERE id = ${userId}
    ` as Array<{ id: string, name: string }>

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const user = users[0]
    console.log('탈퇴할 사용자:', user.name) // 디버깅

    // 관련 데이터 삭제 (CASCADE 때문에 자동으로 삭제되지만 명시적으로)
    try {
      // 1. 신고 데이터 삭제
      await prisma.$executeRaw`DELETE FROM reports WHERE reporterId = ${userId}`
      console.log('신고 데이터 삭제 완료') // 디버깅
      
      // 2. 댓글 삭제
      await prisma.$executeRaw`DELETE FROM comments WHERE authorId = ${userId}`
      console.log('댓글 삭제 완료') // 디버깅
      
      // 3. 게시글 삭제
      await prisma.$executeRaw`DELETE FROM posts WHERE authorId = ${userId}`
      console.log('게시글 삭제 완료') // 디버깅
      
      // 4. 사용자 계정 삭제
      await prisma.$executeRaw`DELETE FROM users WHERE id = ${userId}`
      console.log('사용자 계정 삭제 완료') // 디버깅

    } catch (deleteError: any) {
      console.error('데이터 삭제 오류:', deleteError)
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: '회원탈퇴가 완료되었습니다',
    })

  } catch (error: any) {
    console.error('회원탈퇴 오류:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: `회원탈퇴 중 오류가 발생했습니다: ${error.message}`,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
