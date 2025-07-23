import { NextRequest, NextResponse } from "next/server";
import { DatabaseRepository } from "../../../core/repository/DatabaseRepository";

export async function GET(request: NextRequest) {
  try {
    const teams = await DatabaseRepository.teams.findAll();

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "팀 목록을 가져오는 중 오류가 발생했습니다." },
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
