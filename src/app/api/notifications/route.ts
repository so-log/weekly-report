import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "../../../core/repository/DatabaseRepository";
// Note: auth import needs to be replaced with appropriate auth service

// 사용자의 알림 목록 조회
export async function GET(request: NextRequest) {
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

    // 사용자의 알림 목록 조회
    const notifications = await DatabaseRepository.notifications.findByRecipient(user.id);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "알림 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 알림 생성 (관리자만)
export async function POST(request: NextRequest) {
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
    const sender = await auth.getUserFromToken(token);

    // 관리자 권한 확인
    if (sender.role !== "admin" && sender.role !== "manager") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const {
      recipientId,
      title,
      message,
      type = "manual",
      subType = "report_request",
    } = await request.json();

    if (!recipientId || !title || !message) {
      return NextResponse.json(
        { error: "수신자 ID, 제목, 메시지가 필요합니다." },
        { status: 400 }
      );
    }

    // 수신자 존재 확인
    const recipient = await DatabaseRepository.users.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: "수신자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 알림 생성
    const notification = await DatabaseRepository.notifications.create({
      sender_id: sender.id,
      recipient_id: recipientId,
      title,
      message,
      type,
      sub_type: subType,
      is_read: false,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "알림을 생성하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
