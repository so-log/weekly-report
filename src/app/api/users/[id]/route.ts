import { NextRequest, NextResponse } from "next/server";
import { databaseClient } from "../../../../infrastructure/database/DatabaseClient";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const userId = context.params.id;
    const body = await request.json();
    const { name, email, team_id } = body;

    // 사용자 업데이트
    const pool = databaseClient.getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users 
         SET 
           name = COALESCE($1, name),
           email = COALESCE($2, email),
           team_id = COALESCE($3, team_id),
           updated_at = NOW()
         WHERE id = $4 
         RETURNING *`,
        [name, email, team_id, userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "사용자 정보를 업데이트하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // 사용자 삭제 (관련 보고서도 함께 삭제됨 - CASCADE)
    const pool = databaseClient.getPool();
    const client = await pool.connect();
    try {
      const result = await client.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "사용자를 삭제하는 중 오류가 발생했습니다." },
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
