import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { auth } from "@/lib/auth";

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
    await db.notifications.markAsRead(notificationId);

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
    await db.notifications.delete(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "알림을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
