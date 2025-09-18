import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const { content, userId } = await request.json()

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, message: '필수 정보를 모두 입력해주세요' },
        { status: 400 }
      )
    }

    // 댓글 존재 확인 및 작성자 검증
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: '댓글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: '수정 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 댓글 업데이트
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: '댓글이 수정되었습니다',
      comment: updatedComment,
    })
  } catch (error) {
    console.error('댓글 수정 오류:', error)
    return NextResponse.json(
      { success: false, message: '댓글 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 댓글 존재 확인 및 작성자 검증
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })

    if (!existingComment) {
      return NextResponse.json(
        { success: false, message: '댓글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (existingComment.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: '삭제 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 댓글 삭제 (관련 대댓글도 Cascade로 자동 삭제)
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({
      success: true,
      message: '댓글이 삭제되었습니다',
    })
  } catch (error) {
    console.error('댓글 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '댓글 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
