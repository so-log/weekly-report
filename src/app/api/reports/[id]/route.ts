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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const report = await db.reports.findById(params.id);

    // 보고서가 존재하지 않는 경우
    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "보고서를 찾을 수 없습니다.",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 권한 확인: 관리자/매니저는 모든 보고서 접근 가능, 일반 사용자는 자신의 보고서만
    if (
      user.role !== "admin" &&
      user.role !== "manager" &&
      report.user_id !== user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "보고서를 찾을 수 없습니다.",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 클라이언트 형식으로 변환
    const formattedReport: any = {
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
      issuesRisks: ((report as any).issuesRisks || []).map(
        (issueRisk: any) => ({
          id: issueRisk.id,
          issueDescription: issueRisk.issue_description,
          mitigationPlan: issueRisk.mitigation_plan,
        })
      ),
      createdAt: report.created_at,
      updatedAt: report.updated_at,
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
    return NextResponse.json(
      {
        success: false,
        message: "보고서를 불러오는 중 오류가 발생했습니다.",
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);
    const updateData = await request.json();

    // 먼저 보고서가 존재하고 사용자 권한이 있는지 확인
    const existingReport = await db.reports.findById(params.id);
    if (!existingReport || existingReport.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "보고서를 찾을 수 없습니다.",
        },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 트랜잭션으로 보고서 업데이트
    const result = await db.withTransaction(async (client) => {
      // 기존 데이터 삭제
      await client.query(
        "DELETE FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE report_id = $1)",
        [params.id]
      );
      await client.query("DELETE FROM projects WHERE report_id = $1", [
        params.id,
      ]);
      await client.query("DELETE FROM issues_risks WHERE report_id = $1", [
        params.id,
      ]);

      // 보고서 업데이트
      const reportResult = await client.query(
        `UPDATE reports SET updated_at = NOW() WHERE id = $1 RETURNING *`,
        [params.id]
      );
      const report = reportResult.rows[0];

      // 프로젝트들 생성 (변경된 데이터만)
      let projects = [];
      if (updateData.projects && updateData.projects.length > 0) {
        for (const projectData of updateData.projects) {
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
      } else {
        // 기존 프로젝트 데이터 유지
        const existingProjectsResult = await client.query(
          `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
          [report.id]
        );

        for (const project of existingProjectsResult.rows) {
          const tasksResult = await client.query(
            `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
            [project.id]
          );
          projects.push({ ...project, tasks: tasksResult.rows });
        }
      }

      // 이슈 및 리스크 생성 (변경된 데이터만)
      let issuesRisks = [];
      if (updateData.issuesRisks && updateData.issuesRisks.length > 0) {
        for (const issueRiskData of updateData.issuesRisks) {
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
      } else {
        // 기존 이슈/리스크 데이터 유지
        const existingIssuesRisksResult = await client.query(
          `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
          [report.id]
        );
        issuesRisks = existingIssuesRisksResult.rows;
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
    console.error("Update report error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "보고서 수정 중 오류가 발생했습니다.",
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request);

    // 트랜잭션으로 보고서 삭제
    await db.withTransaction(async (client) => {
      // 관련 데이터 삭제
      await client.query(
        "DELETE FROM tasks WHERE project_id IN (SELECT id FROM projects WHERE report_id = $1)",
        [params.id]
      );
      await client.query("DELETE FROM projects WHERE report_id = $1", [
        params.id,
      ]);
      await client.query("DELETE FROM issues_risks WHERE report_id = $1", [
        params.id,
      ]);

      // 보고서 삭제
      const result = await client.query(
        "DELETE FROM reports WHERE id = $1 AND user_id = $2",
        [params.id, user.id]
      );

      if (result.rowCount === 0) {
        throw new Error("보고서를 찾을 수 없습니다.");
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "보고서가 삭제되었습니다.",
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
    return NextResponse.json(
      {
        success: false,
        message: "보고서 삭제 중 오류가 발생했습니다.",
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
