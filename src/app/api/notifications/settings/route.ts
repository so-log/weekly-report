import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "../../../../core/repository/DatabaseRepository";
// Note: auth import needs to be replaced with appropriate auth service

// 팀별 알림 설정 조회
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

    // 관리자 권한 확인
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "팀 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 팀별 시스템 알림 설정 조회
    // TODO: Implement systemNotificationSettings in DatabaseRepository
    const settings = []; // await DatabaseRepository.systemNotificationSettings.findByTeamId(teamId);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "알림 설정을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 팀별 알림 설정 생성/수정
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
    const user = await auth.getUserFromToken(token);

    // 관리자 권한 확인
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { teamId, dayOfWeek, isActive } = await request.json();

    if (!teamId || dayOfWeek === undefined || isActive === undefined) {
      return NextResponse.json(
        { error: "팀 ID, 요일, 활성화 상태가 필요합니다." },
        { status: 400 }
      );
    }

    // 팀 존재 확인
    const team = await DatabaseRepository.teams.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 시스템 알림 설정 생성/수정
    // TODO: Implement systemNotificationSettings in DatabaseRepository
    const setting = null; // await DatabaseRepository.systemNotificationSettings.createOrUpdate({
      team_id: teamId,
      day_of_week: dayOfWeek,
      is_active: isActive,
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error creating/updating notification settings:", error);
    return NextResponse.json(
      { error: "알림 설정을 저장하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 팀별 알림 설정 삭제
export async function DELETE(request: NextRequest) {
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

    // 관리자 권한 확인
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");
    const dayOfWeek = searchParams.get("dayOfWeek");

    if (!teamId || !dayOfWeek) {
      return NextResponse.json(
        { error: "팀 ID와 요일이 필요합니다." },
        { status: 400 }
      );
    }

    // 시스템 알림 설정 삭제
    // TODO: Implement systemNotificationSettings in DatabaseRepository
    // await DatabaseRepository.systemNotificationSettings.deleteByTeamAndDay(
      teamId,
      parseInt(dayOfWeek)
    );

    return NextResponse.json({ message: "알림 설정이 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting notification settings:", error);
    return NextResponse.json(
      { error: "알림 설정을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
