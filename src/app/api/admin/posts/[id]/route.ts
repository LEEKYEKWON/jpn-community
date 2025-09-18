import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 게시글 존재 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, title: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 관리자 권한으로 게시글 삭제 (관련 댓글도 Cascade로 자동 삭제)
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다',
    })
  } catch (error) {
    console.error('관리자 게시글 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '게시글 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
