"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeamReport {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  projects: any[];
}

interface TeamReportsTableProps {
  teamId: string | null;
  selectedDate: Date;
}

export default function TeamReportsTable({
  teamId,
  selectedDate,
}: TeamReportsTableProps) {
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTeamReports = async () => {
      setIsLoading(true);
      try {
        let url = "/api/reports";
        if (teamId) {
          url += `?teamId=${teamId}`;
        }

        const token = localStorage.getItem("auth_token");
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // /api/reports는 { success: true, data: [...] } 형태로 반환
          const reportsData = data.success ? data.data : data;
          setReports(reportsData);
        }
      } catch (error) {
        console.error("Error fetching team reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamReports();
  }, [teamId]);

  const handleViewReport = (reportId: string) => {
    router.push(`/edit/${reportId}`);
  };

  // 통계 집계
  const 전체 = reports.length;
  const 완료 = reports.filter(
    (r: any) =>
      r.projects?.length &&
      r.projects.every((p: any) => p.status === "completed")
  ).length;
  const 지연 = reports.filter((r: any) =>
    r.projects?.some((p: any) => p.status === "delayed")
  ).length;
  const 진행중 = 전체 - 완료 - 지연;

  // 카드형 리스트 렌더링 함수
  function renderReportCard(report: any) {
    const 담당자 = report.user?.name || "알 수 없음";
    const 팀 = report.user?.team_name || report.user?.team || "-";
    // 진행상태 판별: 프로젝트 중 하나라도 status가 'delayed'면 '지연', 모두 'completed'면 '완료', 아니면 '진행중'
    let 진행상태 = "진행중";
    if (report.projects?.length) {
      if (report.projects.some((p: any) => p.status === "delayed")) {
        진행상태 = "지연";
      } else if (report.projects.every((p: any) => p.status === "completed")) {
        진행상태 = "완료";
      }
    }
    const 프로젝트명 = report.projects?.[0]?.name || "-";
    const 작성일 = (() => {
      try {
        const d = new Date(report.createdAt || report.created_at);
        if (isNaN(d.getTime())) return "-";
        return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}.${String(d.getDate()).padStart(2, "0")}`;
      } catch {
        return "-";
      }
    })();
    return (
      <div
        key={report.id}
        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 shadow-sm"
      >
        <div className="flex items-center gap-4 min-w-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{담당자.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-semibold text-lg truncate">{담당자}</div>
            <div className="text-xs text-gray-500 truncate">{팀}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 min-w-0">
          <div className="text-sm font-medium min-w-0 truncate">
            {프로젝트명}
          </div>
          <div className="text-sm min-w-0 truncate">{작성일}</div>
          <div
            className={`text-xs px-2 py-1 rounded-full font-bold ${
              진행상태 === "완료"
                ? "bg-green-100 text-green-700"
                : 진행상태 === "지연"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {진행상태}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewReport(report.id)}
        >
          상세보기
        </Button>
      </div>
    );
  }

  // 상단 통계 카드 렌더링
  function renderStats() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold">{전체}</div>
          <div className="text-xs text-gray-500 mt-1">전체 보고서</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-green-700">{완료}</div>
          <div className="text-xs text-green-700 mt-1">완료</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-blue-700">{진행중}</div>
          <div className="text-xs text-blue-700 mt-1">진행중</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900 rounded-lg shadow p-4 flex flex-col items-center">
          <div className="text-2xl font-bold text-red-700">{지연}</div>
          <div className="text-xs text-red-700 mt-1">지연</div>
        </div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>전체 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStats()}
          {isLoading ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              이번 주에 제출된 보고서가 없습니다.
            </p>
          ) : (
            <div className="space-y-4">{reports.map(renderReportCard)}</div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>팀 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>팀 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            이번 주에 제출된 보고서가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User size={20} />
          <span>팀 보고서 ({reports.length}개)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStats()}
        <div className="space-y-4">{reports.map(renderReportCard)}</div>
      </CardContent>
    </Card>
  );
}
