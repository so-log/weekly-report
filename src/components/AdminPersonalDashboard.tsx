"use client";

import DateSelector from "@/components/DateSelector";
import SummaryCards from "@/components/SummaryCards";
import ProjectProgress from "@/components/ProjectProgress";
import TaskTable from "@/components/TaskTable";
import IssuesRisksTable from "@/components/IssuesRisksTable";
import NextWeekPlans from "@/components/NextWeekPlans";
import { addDays, format, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { usePersonalReports } from "@/hooks/use-personal-reports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function AdminPersonalDashboard() {
  const router = useRouter();
  const { reports } = usePersonalReports();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // URL 파라미터에서 탭 정보 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab === "reports") {
        setActiveTab("reports");
      }
    }
  }, []);

  // 주간 날짜 범위 계산
  const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);

  const formattedRange = `${format(monday, "yyyy년 M월 d일", {
    locale: ko,
  })} - ${format(friday, "yyyy년 M월 d일", { locale: ko })}`;

  // 주간 시작일 계산 함수
  const getWeekStart = (date: Date) => {
    const day = date.getDay();
    let diff;

    if (day === 0) {
      diff = -6;
    } else {
      diff = 1 - day;
    }

    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
  };

  // 현재 선택된 주간의 보고서들 찾기 (관리자 본인의 보고서만)
  const currentWeekReports = reports.filter((report) => {
    const reportStartDate =
      report.weekStart instanceof Date
        ? report.weekStart
        : new Date(report.weekStart);

    const selectedMonday = getWeekStart(selectedDate);
    const selectedSunday = addDays(selectedMonday, 6);

    const toYMD = (date: Date) => format(date, "yyyy-MM-dd");

    const reportStartYMD = toYMD(reportStartDate);
    const selectedMondayYMD = toYMD(selectedMonday);
    const selectedSundayYMD = toYMD(selectedSunday);

    const isInSelectedWeek =
      reportStartYMD >= selectedMondayYMD &&
      reportStartYMD <= selectedSundayYMD;

    return isInSelectedWeek;
  });

  // 통합 보고서 생성
  const combinedReport =
    currentWeekReports.length > 0
      ? {
          id: "combined",
          weekStart: currentWeekReports[0].weekStart,
          weekEnd: currentWeekReports[0].weekEnd,
          projects: currentWeekReports.flatMap(
            (report) => report.projects || []
          ),
          issuesRisks: currentWeekReports.flatMap(
            (report) => report.issuesRisks || []
          ),
          createdAt: currentWeekReports[0].createdAt,
          updatedAt: currentWeekReports[0].updatedAt,
          user: currentWeekReports[0].user,
        }
      : null;

  const handleCreateReport = () => {
    const dateParam = selectedDate.toISOString();
    router.push(
      `/create?date=${encodeURIComponent(dateParam)}&returnTo=admin-reports`
    );
  };

  // 삭제 로직 구현 필요
  const handleDeleteReport = async (reportId: string) => {
    if (!confirm("정말로 이 보고서를 삭제하시겠습니까?")) return;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        // 보고서 목록 탭으로 이동
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "reports");
        window.location.href = url.toString();
        return;
      } else {
        const data = await res.json();
        alert(data.message || "삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              내 주간업무보고
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {formattedRange}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <DateSelector value={selectedDate} onChange={setSelectedDate} />

            {/* 보고서 작성 버튼 - 항상 표시 */}
            <Button
              onClick={handleCreateReport}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>보고서 작성</span>
            </Button>
          </div>
        </div>

        {/* 탭 구조 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="reports">보고서 목록</TabsTrigger>
          </TabsList>

          {/* 대시보드 탭 */}
          <TabsContent value="dashboard">
            {/* 보고서가 없을 때 안내 메시지 */}
            {!combinedReport && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-900 dark:text-blue-100 font-medium">
                      이번 주 보고서가 없습니다
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                      {formattedRange} 기간의 주간업무보고를 작성해보세요.
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateReport}
                    className="flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>지금 작성하기</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 대시보드 섹션 */}
            {combinedReport && (
              <>
                <SummaryCards currentReport={combinedReport} />

                {/* Project Progress Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      프로젝트 진행률
                    </h2>
                  </div>
                  <ProjectProgress currentReport={combinedReport} />
                </div>

                {/* Task Table Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      세부 업무 현황
                    </h2>
                  </div>
                  <TaskTable
                    currentReport={combinedReport}
                    assigneeFilter="all"
                    statusFilter="all"
                  />
                </div>

                {/* Next Week Plans Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      다음주 계획
                    </h2>
                  </div>
                  <NextWeekPlans currentReport={combinedReport} />
                </div>

                {/* Issues and Risks Section */}
                <IssuesRisksTable currentReport={combinedReport} />
              </>
            )}
          </TabsContent>

          {/* 보고서 목록 탭 */}
          <TabsContent value="reports" className="w-full">
            <div className="w-full">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>작성한 보고서가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const reportStartDate =
                      report.weekStart instanceof Date
                        ? report.weekStart
                        : new Date(report.weekStart);
                    const reportEndDate =
                      report.weekEnd instanceof Date
                        ? report.weekEnd
                        : new Date(report.weekEnd);

                    return (
                      <div
                        key={report.id}
                        className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                      >
                        <div>
                          <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {report.projects?.[0]?.name || "(프로젝트명 없음)"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {reportStartDate.toLocaleDateString("ko-KR")} ~{" "}
                            {reportEndDate.toLocaleDateString("ko-KR")}
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/edit/${report.id}?returnTo=admin-reports`
                              )
                            }
                            className="flex items-center space-x-1"
                          >
                            <span>수정</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <span>삭제</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
