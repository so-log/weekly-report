import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 실제 구현에서는 토큰 무효화 처리
    return NextResponse.json({
      success: true,
      message: "로그아웃되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
