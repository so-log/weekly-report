"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import {
  Search,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import DateSelector from "@/components/DateSelector";
import TeamSelector from "@/components/TeamSelector";
import { useReports } from "@/hooks/use-reports";
import { ClientReport } from "@/lib/api";
import ReportDetailModal from "@/components/ReportDetailModal";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "completed" | "in-progress" | "delayed"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedReport, setSelectedReport] = useState<ClientReport | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const itemsPerPage = 8;

  const { reports: allReports } = useReports();

  // 팀 목록 매핑
  const [teamMap, setTeamMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/teams");
        if (response.ok) {
          const data = await response.json();
          // id → name 매핑 객체 생성
          const map: Record<string, string> = {};
          data.forEach((team: { id: string; name: string }) => {
            map[team.id] = team.name;
          });
          setTeamMap(map);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // 주간 날짜 범위 계산 (월~일)
  const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  const formattedRange = `${format(monday, "yyyy년 M월 d일")} - ${format(
    sunday,
    "yyyy년 M월 d일"
  )}`;

  // 프론트엔드에서 팀/날짜로 필터링
  const reports = allReports.filter((report) => {
    // 날짜 필터: report.weekStart가 monday~sunday 사이인지
    const reportStart =
      report.weekStart instanceof Date
        ? report.weekStart
        : new Date(report.weekStart);
    const isInWeek = reportStart >= monday && reportStart <= sunday;
    // 팀 필터: selectedTeamId가 있으면 report.user.team_id와 일치해야 함
    const matchesTeam =
      !selectedTeamId ||
      (report.user && report.user.team_id === selectedTeamId);
    return isInWeek && matchesTeam;
  });

  // 상태별 분류 및 카운트/퍼센트 계산 (status: 'in-progress', 'completed', 'delayed'만 사용)
  const totalReports = reports.length;
  const completedReports = reports.filter(
    (r) =>
      r.projects?.length > 0 &&
      r.projects.every((p) => p.status === "completed")
  ).length;
  const delayedReports = reports.filter((r) =>
    r.projects?.some((p) => p.status === "delayed")
  ).length;
  const inProgressReports = reports.filter(
    (r) =>
      r.projects?.some((p) => p.status === "in-progress") &&
      !r.projects.every((p) => p.status === "completed") &&
      !r.projects.some((p) => p.status === "delayed")
  ).length;

  const completedPercent =
    totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;
  const inProgressPercent =
    totalReports > 0 ? Math.round((inProgressReports / totalReports) * 100) : 0;
  const delayedPercent =
    totalReports > 0 ? Math.round((delayedReports / totalReports) * 100) : 0;

  // 상태별 필터링
  const filteredReports = reports.filter((report) => {
    if (selectedStatus === "all") return true;
    if (selectedStatus === "completed")
      return (
        report.projects?.length > 0 &&
        report.projects.every((p) => p.status === "completed")
      );
    if (selectedStatus === "delayed")
      return report.projects?.some((p) => p.status === "delayed");
    if (selectedStatus === "in-progress")
      return report.projects?.some((p) => p.status === "in-progress");
    return true;
  });

  // 검색 필터링
  const searchedReports = filteredReports.filter((report) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const userName = report.user?.name?.toLowerCase() || "";
    const projectNames = (report.projects || [])
      .map((p) => p.name?.toLowerCase() || "")
      .join(" ");
    const taskNames = (report.projects || [])
      .flatMap((p) => p.tasks?.map((t) => t.name?.toLowerCase() || "") || [])
      .join(" ");
    return (
      userName.includes(query) ||
      projectNames.includes(query) ||
      taskNames.includes(query)
    );
  });

  // 페이지네이션
  const totalPages = Math.ceil(searchedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = searchedReports.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 보고서의 대표 status 계산 함수 (delayed > in-progress > completed)
  const getReportStatus = (report: ClientReport) => {
    if (report.projects?.some((p) => p.status === "delayed")) return "delayed";
    if (report.projects?.some((p) => p.status === "in-progress"))
      return "in-progress";
    if (
      report.projects?.length > 0 &&
      report.projects.every((p) => p.status === "completed")
    )
      return "completed";
    return "in-progress"; // 기본값
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            완료
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            진행중
          </Badge>
        );
      case "delayed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            지연
          </Badge>
        );
      default:
        return null;
    }
  };

  // 엑셀 다운로드 함수
  const downloadExcel = () => {
    // 엑셀 데이터 준비
    const excelData = searchedReports.map((report) => {
      const teamId = report.user?.team_id;
      const teamName = teamMap[teamId ?? ""] || "-";
      const status = getReportStatus(report);
      const projectNames = (report.projects || [])
        .map((p) => p.name)
        .filter(Boolean)
        .join(", ");
      const taskNames = (report.projects || [])
        .flatMap((p) => p.tasks?.map((t) => t.name) || [])
        .filter(Boolean)
        .join(", ");
      const progress =
        report.projects?.length > 0
          ? Math.round(
              report.projects.reduce((sum, p) => sum + (p.progress || 0), 0) /
                report.projects.length
            )
          : 0;

      return {
        사용자명: report.user?.name || "알 수 없음",
        팀: teamName,
        프로젝트: projectNames || "-",
        업무: taskNames || "-",
        상태:
          status === "completed"
            ? "완료"
            : status === "delayed"
            ? "지연"
            : "진행중",
        진행률: `${progress}%`,
        작성일:
          report.weekStart instanceof Date
            ? format(report.weekStart, "yyyy-MM-dd")
            : format(new Date(report.weekStart), "yyyy-MM-dd"),
      };
    });

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 자동 조정
    const colWidths = [
      { wch: 15 }, // 사용자명
      { wch: 12 }, // 팀
      { wch: 30 }, // 프로젝트
      { wch: 40 }, // 업무
      { wch: 10 }, // 상태
      { wch: 10 }, // 진행률
      { wch: 12 }, // 작성일
    ];
    ws["!cols"] = colWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(wb, ws, "주간보고서");

    // 파일명 생성 (날짜 범위 포함)
    const fileName = `주간보고서_${format(monday, "yyyyMMdd")}-${format(
      sunday,
      "yyyyMMdd"
    )}.xlsx`;

    // 파일 다운로드
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              주간 업무 보고 대시보드
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {formattedRange}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <DateSelector value={selectedDate} onChange={setSelectedDate} />
            <TeamSelector
              selectedTeamId={selectedTeamId}
              onTeamChange={setSelectedTeamId}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* 전체 보고서 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    전체 보고서
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalReports}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 진행 완료 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="min-h-[60px] flex flex-col justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    진행 완료
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {completedReports}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalReports > 0 && completedReports > 0 ? (
                      <>
                        전체의{" "}
                        <span className="text-green-700 dark:text-green-400">
                          {completedPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 진행 중 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="min-h-[60px] flex flex-col justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    진행 중
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {inProgressReports}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalReports > 0 && inProgressReports > 0 ? (
                      <>
                        전체의{" "}
                        <span className="text-blue-700 dark:text-blue-400">
                          {inProgressPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 지연 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="min-h-[60px] flex flex-col justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    지연
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {delayedReports}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalReports > 0 && delayedReports > 0 ? (
                      <>
                        전체의{" "}
                        <span className="text-red-700 dark:text-red-400">
                          {delayedPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <Button
              variant={selectedStatus === "all" ? "default" : "outline"}
              onClick={() => setSelectedStatus("all")}
            >
              전체
            </Button>
            <Button
              variant={selectedStatus === "completed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("completed")}
            >
              진행 완료
            </Button>
            <Button
              variant={selectedStatus === "in-progress" ? "default" : "outline"}
              onClick={() => setSelectedStatus("in-progress")}
            >
              진행 중
            </Button>
            <Button
              variant={selectedStatus === "delayed" ? "default" : "outline"}
              onClick={() => setSelectedStatus("delayed")}
            >
              지연
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="팀원 또는 보고서 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white dark:bg-gray-800"
              onClick={downloadExcel}
              disabled={searchedReports.length === 0}
            >
              <Download size={16} />
              <span>엑셀 다운로드</span>
            </Button>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="min-h-[455px]">
          {paginatedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {paginatedReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src="/placeholder.svg"
                            alt={report.user?.name || "알 수 없음"}
                          />
                          <AvatarFallback className="text-xs">
                            {report.user?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {report.user?.name || "알 수 없음"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(() => {
                              const teamId = report.user?.team_id;
                              const teamName = teamMap[teamId ?? ""];

                              return teamName || "-";
                            })()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(getReportStatus(report))}
                    </div>

                    <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {report.projects[0]?.name || "프로젝트 없음"}
                    </h3>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                      {(() => {
                        const taskNames = (report.projects || [])
                          .flatMap((p) => p.tasks?.map((t) => t.name) || [])
                          .filter(Boolean)
                          .slice(0, 2);
                        return taskNames.length > 0
                          ? `${taskNames.join(", ")}`
                          : "-";
                      })()}
                    </p>

                    <div className="flex items-center justify-between">
                      {/* <div className="text-xs text-gray-500 dark:text-gray-400">
                        {report.submittedAt
                          ? format(report.submittedAt, "yyyy.MM.dd 제출")
                          : "미제출"}
                      </div> */}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs bg-transparent"
                      onClick={() => {
                        setSelectedReport(report);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      상세보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  보고서가 없습니다
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            소금빵은 맛있어 후추소금빠앙
          </p>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}
