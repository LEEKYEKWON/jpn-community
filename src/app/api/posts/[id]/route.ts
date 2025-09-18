import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 게시글 조회 및 조회수 증가
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
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
    })

    if (!post) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 조회수 증가
    await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    })

    // 댓글 조회
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        viewCount: post.viewCount + 1, // 증가된 조회수 반영
      },
      comments,
    })
  } catch (error) {
    console.error('게시글 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '게시글 조회 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { title, content, userId } = await request.json()

    // 게시글 존재 확인 및 작성자 검증
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: '수정 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 게시글 업데이트
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
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
      message: '게시글이 수정되었습니다',
      post: updatedPost,
    })
  } catch (error) {
    console.error('게시글 수정 오류:', error)
    return NextResponse.json(
      { success: false, message: '게시글 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, message: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    // 게시글 존재 확인 및 작성자 검증
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== userId) {
      return NextResponse.json(
        { success: false, message: '삭제 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 게시글 삭제 (관련 댓글도 Cascade로 자동 삭제)
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({
      success: true,
      message: '게시글이 삭제되었습니다',
    })
  } catch (error) {
    console.error('게시글 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '게시글 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
