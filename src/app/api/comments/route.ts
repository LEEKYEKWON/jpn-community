import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { content, postId, authorId } = await request.json()

    if (!content || !postId || !authorId) {
      return NextResponse.json(
        { success: false, message: '필수 정보를 모두 입력해주세요' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
      },
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
      message: '댓글이 작성되었습니다',
      comment,
    })
  } catch (error) {
    console.error('댓글 작성 오류:', error)
    return NextResponse.json(
      { success: false, message: '댓글 작성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
