import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;

    // 팀이 존재하는지 확인
    const team = await db.teams.findById(teamId);
    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 팀의 보고서들 조회
    const reports = await db.reports.findByTeamId(teamId);

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
