import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "../../../../../core/repository/DatabaseRepository";
import { databaseClient } from "../../../../../infrastructure/database/DatabaseClient";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

    // "all"인 경우 모든 팀의 보고서 반환
    if (teamId === "all") {
      const pool = databaseClient.getPool();
      const client = await pool.connect();
      try {
        // 모든 사용자의 보고서 조회
        const reportsResult = await client.query(
          `SELECT r.*, u.name as user_name, u.email as user_email, u.team_id, t.name as team_name
           FROM reports r 
           JOIN users u ON r.user_id = u.id 
           LEFT JOIN teams t ON u.team_id = t.id
           ORDER BY r.week_start DESC, u.name`
        );

        const allReports = [];

        for (const report of reportsResult.rows) {
          // 프로젝트 조회
          const projectsResult = await client.query(
            `SELECT * FROM projects WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          const projects = [];
          for (const project of projectsResult.rows) {
            // 업무 조회
            const tasksResult = await client.query(
              `SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at`,
              [project.id]
            );

            projects.push({
              ...project,
              tasks: tasksResult.rows,
            });
          }

          // 이슈 및 리스크 조회
          const issuesRisksResult = await client.query(
            `SELECT * FROM issues_risks WHERE report_id = $1 ORDER BY created_at`,
            [report.id]
          );

          allReports.push({
            ...report,
            projects,
            issuesRisks: issuesRisksResult.rows,
            user: {
              id: report.user_id,
              name: report.user_name,
              email: report.user_email,
              password_hash: "",
              team_id: report.team_id,
              role: "user",
              created_at: "",
              updated_at: "",
            },
          });
        }

        return NextResponse.json(allReports);
      } finally {
        client.release();
      }
    }

    // 팀이 존재하는지 확인
    const team = await DatabaseRepository.teams.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 팀의 보고서들 조회
    const reports = await DatabaseRepository.reports.findByTeamId(teamId);

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching team reports:", error);
    return NextResponse.json(
      { error: "팀 보고서를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
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
