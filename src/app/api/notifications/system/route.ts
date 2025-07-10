import { NextRequest, NextResponse } from "next/server";
import { db, DatabaseReport } from "@/lib/database";

// 시스템 자동 알림 생성 (매주 화요일 실행)
export async function POST(request: NextRequest) {
  try {
    // API 키 확인 (보안을 위해)
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.SYSTEM_API_KEY) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 이번 주 보고서를 제출하지 않은 사용자 찾기
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // 월요일
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6); // 일요일
    endOfWeek.setHours(23, 59, 59, 999);

    // 이번 주 보고서를 제출한 사용자 ID 목록
    const submittedReports = await db.reports.findAllByDateRange(
      startOfWeek,
      endOfWeek
    );
    const submittedUserIds = new Set(
      submittedReports.map((report: DatabaseReport) => report.user_id)
    );

    // 오늘 요일 확인 (0=일요일, 1=월요일, ..., 6=토요일)
    const today = new Date();
    const dayOfWeek = today.getDay();

    // 모든 팀의 알림 설정 조회
    const allTeams = await db.teams.findAll();
    const notifications = [];

    for (const team of allTeams) {
      // 해당 팀의 시스템 알림 설정 조회
      const teamSettings = await db.systemNotificationSettings.findByTeamId(
        team.id
      );
      const todaySetting = teamSettings.find(
        (setting) => setting.day_of_week === dayOfWeek && setting.is_active
      );

      if (todaySetting) {
        // 해당 팀의 사용자들 조회
        const teamUsers = await db.users.findByTeam(team.id);

        // 이번 주 보고서를 제출하지 않은 사용자 필터링
        const usersWithoutReports = teamUsers.filter(
          (user) => !submittedUserIds.has(user.id)
        );

        // 각 사용자에게 알림 생성
        for (const user of usersWithoutReports) {
          const notification = await db.notifications.create({
            sender_id: null, // 시스템 알림
            recipient_id: user.id,
            title: "주간 보고서 제출 알림",
            message:
              "이번 주 주간 보고서를 아직 제출하지 않았습니다. 설정된 요일까지 제출해주세요.",
            type: "system",
            sub_type: "report_reminder",
            is_read: false,
          });
          notifications.push(notification);
        }
      }
    }

    return NextResponse.json({
      message: `${notifications.length}명의 사용자에게 시스템 알림이 전송되었습니다.`,
      notifications,
    });
  } catch (error) {
    console.error("Error creating system notifications:", error);
    return NextResponse.json(
      { error: "시스템 알림 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
