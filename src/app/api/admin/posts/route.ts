import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        viewCount: true,
        likeCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      posts,
    })
  } catch (error) {
    console.error('관리자 게시글 목록 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '게시글 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
