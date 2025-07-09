import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { auth } from "@/lib/auth";
import {
  ReportWithDetails,
  DatabaseUser,
  DatabaseProject,
  DatabaseTask,
} from "@/lib/database";

// IssueRiskType 타입 정의
interface IssueRiskType {
  id: string;
  issue_description: string;
  mitigation_plan: string;
}

// 인증된 사용자 정보 가져오기
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("인증 토큰이 필요합니다.");
  }

  const token = authHeader.substring(7);
  return await auth.getUserFromToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    console.log("Authenticated user:", user); // 디버그용

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let reports;

    if (startDate && endDate) {
      // 날짜 범위로 현재 사용자 보고서 조회
      reports = await db.reports.findByDateRange(user.id, startDate, endDate);
    } else {
      // 현재 사용자의 모든 보고서 조회
      reports = await db.reports.findByUserId(user.id);
    }

    console.log("Found reports count:", reports.length); // 디버그용

    // 클라이언트 형식으로 변환
    const formattedReports = reports.map(
      (
        report: ReportWithDetails & {
          user?: DatabaseUser;
          issuesRisks?: IssueRiskType[];
        }
      ) => ({
        id: report.id,
        weekStart: report.week_start,
        weekEnd: report.week_end,
        user: report.user || {
          id: report.user_id,
          name: "알 수 없음",
          email: "",
        },
        projects: (
          report.projects as (DatabaseProject & { tasks: DatabaseTask[] })[]
        ).map((project) => ({
          id: project.id,
          name: project.name,
          progress: project.progress,
          status: project.status,
          tasks: (project.tasks as DatabaseTask[]).map((task) => ({
            id: task.id,
            name: task.name,
            status: task.status,
            startDate: task.start_date || "",
            dueDate: task.due_date || "",
            notes: task.notes || "",
            planDetail: (task as { plan_detail?: string })?.plan_detail || "",
            type: (task as { type?: string })?.type || "current",
          })),
        })),
        issuesRisks: Array.isArray(
          (report as { issuesRisks?: IssueRiskType[] }).issuesRisks
        )
          ? (
              (report as { issuesRisks?: IssueRiskType[] }).issuesRisks ?? []
            ).map((issueRisk) => ({
              id: issueRisk.id,
              issueDescription: issueRisk.issue_description,
              mitigationPlan: issueRisk.mitigation_plan,
            }))
          : [],
        createdAt: report.created_at,
        updatedAt: report.updated_at,
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: formattedReports,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  } catch (error) {
    console.error("Get personal reports error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "개인 보고서를 불러오는 중 오류가 발생했습니다.",
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
