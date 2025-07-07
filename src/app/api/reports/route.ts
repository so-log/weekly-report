import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { auth } from "@/lib/auth";

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
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let reports;

    if (startDate && endDate) {
      reports = await db.reports.findByDateRange(user.id, startDate, endDate);
    } else {
      reports = await db.reports.findByUserId(user.id);
    }

    // 클라이언트 형식으로 변환
    const formattedReports = reports.map((report: any) => ({
      id: report.id,
      weekStart: report.week_start,
      weekEnd: report.week_end,
      projects: report.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        progress: project.progress,
        status: project.status,
        tasks: project.tasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          startDate: task.start_date || "",
          dueDate: task.due_date || "",
          notes: task.notes || "",
          planDetail: task.plan_detail || "",
          type: task.type || "current",
        })),
      })),
      issuesRisks: (report.issuesRisks || []).map((issueRisk: any) => ({
        id: issueRisk.id,
        issueDescription: issueRisk.issue_description,
        mitigationPlan: issueRisk.mitigation_plan,
      })),
      createdAt: report.created_at,
      updatedAt: report.updated_at,
    }));

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
    console.error("Get reports error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "보고서를 불러오는 중 오류가 발생했습니다.",
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const reportData = await request.json();

    // 트랜잭션으로 보고서와 관련 데이터 생성
    const result = await db.withTransaction(async (client) => {
      // 보고서 생성
      const reportResult = await client.query(
        `INSERT INTO reports (user_id, week_start, week_end) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [user.id, reportData.weekStart, reportData.weekEnd]
      );
      const report = reportResult.rows[0];

      // 프로젝트들 생성
      const projects = [];
      for (const projectData of reportData.projects || []) {
        const projectResult = await client.query(
          `INSERT INTO projects (report_id, name, progress, status) 
           VALUES ($1, $2, $3, $4) 
           RETURNING *`,
          [
            report.id,
            projectData.name,
            projectData.progress,
            projectData.status,
          ]
        );
        const project = projectResult.rows[0];

        // 업무들 생성
        const tasks = [];
        for (const taskData of projectData.tasks || []) {
          const taskResult = await client.query(
            `INSERT INTO tasks (project_id, name, status, start_date, due_date, notes, plan_detail, type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
              project.id,
              taskData.name,
              taskData.status,
              taskData.startDate,
              taskData.dueDate,
              taskData.notes,
              taskData.planDetail,
              taskData.type || "current",
            ]
          );
          tasks.push(taskResult.rows[0]);
        }

        projects.push({ ...project, tasks });
      }

      // 이슈 및 리스크 생성
      const issuesRisks = [];
      for (const issueRiskData of reportData.issuesRisks || []) {
        const issueRiskResult = await client.query(
          `INSERT INTO issues_risks (report_id, issue_description, mitigation_plan) 
           VALUES ($1, $2, $3) 
           RETURNING *`,
          [
            report.id,
            issueRiskData.issueDescription,
            issueRiskData.mitigationPlan,
          ]
        );
        issuesRisks.push(issueRiskResult.rows[0]);
      }

      return { ...report, projects, issuesRisks };
    });

    // 클라이언트 형식으로 변환
    const formattedReport = {
      id: result.id,
      weekStart: result.week_start,
      weekEnd: result.week_end,
      projects: result.projects.map((project: any) => ({
        id: project.id,
        name: project.name,
        progress: project.progress,
        status: project.status,
        tasks: project.tasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          startDate: task.start_date || "",
          dueDate: task.due_date || "",
          notes: task.notes || "",
          planDetail: task.plan_detail || "",
          type: task.type || "current",
        })),
      })),
      issuesRisks: (result.issuesRisks || []).map((issueRisk: any) => ({
        id: issueRisk.id,
        issueDescription: issueRisk.issue_description,
        mitigationPlan: issueRisk.mitigation_plan,
      })),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        data: formattedReport,
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
    console.error("Create report error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "보고서 생성 중 오류가 발생했습니다.",
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

// OPTIONS 요청 처리 (preflight)
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
