import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 실제 구현에서는 JWT 토큰을 무효화하거나 세션을 삭제해야 합니다
    return NextResponse.json({
      success: true,
      message: '로그아웃 완료',
    })
  } catch (error) {
    console.error('로그아웃 오류:', error)
    return NextResponse.json(
      { success: false, message: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}


