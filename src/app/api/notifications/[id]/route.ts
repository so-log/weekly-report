import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "../../../../core/repository/DatabaseRepository";
// Note: auth import needs to be replaced with appropriate auth service

// 알림 읽음 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await auth.getUserFromToken(token);

    const notificationId = params.id;

    // 알림 읽음 처리
    await DatabaseRepository.notifications.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "알림을 읽음 처리하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 알림 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 인증 토큰 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await auth.getUserFromToken(token);

    const notificationId = params.id;

    // 알림 삭제
    await DatabaseRepository.notifications.delete(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "알림을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
