import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    // 모든 사용자 조회 (팀 정보 포함)
    const client = await db.getPool().connect();
    try {
      const result = await client.query(
        `SELECT u.*, t.name as team_name 
         FROM users u 
         LEFT JOIN teams t ON u.team_id = t.id 
         ORDER BY u.name`
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "사용자 목록을 가져오는 중 오류가 발생했습니다." },
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
