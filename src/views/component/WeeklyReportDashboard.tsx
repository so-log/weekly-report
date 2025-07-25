"use client";

import DateSelector from "./DateSelector";
import SummaryCards from "./SummaryCards";
import ProjectProgress from "./ProjectProgress";
import TaskTable from "./TaskTable";

import { addDays, format, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import { Filter, Plus } from "lucide-react";
import IssuesRisksTable from "./IssuesRisksTable";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { usePersonalReports } from "../viewModel/use-personal-reports";
import NextWeekPlans from "./NextWeekPlans";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/Popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/Select";
import { X } from "lucide-react";

export default function WeeklyReportDashboard() {
  const router = useRouter();
  const { reports } = usePersonalReports();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 주간 날짜 범위 계산
  const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);

  const formattedRange = `${format(monday, "yyyy년 M월 d일", {
    locale: ko,
  })} - ${format(friday, "yyyy년 M월 d일", { locale: ko })}`;

  // 주간 시작일 계산 함수 (CreateReportPage와 동일한 로직)
  const getWeekStart = (date: Date) => {
    const day = date.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    let diff;

    if (day === 0) {
      // 일요일인 경우 전주 월요일로
      diff = -6;
    } else {
      // 월요일~토요일인 경우 이번주 월요일로
      diff = 1 - day;
    }

    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
  };

  // 현재 선택된 주간의 보고서들 찾기 (모든 보고서)
  const currentWeekReports = reports.filter((report) => {
    // report.weekStart가 Date 객체인지 문자열인지 확인
    const reportStartDate =
      report.weekStart instanceof Date
        ? report.weekStart
        : new Date(report.weekStart);

    // 선택된 날짜의 월~일 주차 범위 계산
    const selectedMonday = getWeekStart(selectedDate);
    const selectedSunday = addDays(selectedMonday, 6);

    // 날짜를 'YYYY-MM-DD' 형식으로 변환해서 비교 (타임존 문제 해결)
    const toYMD = (date: Date) => format(date, "yyyy-MM-dd");

    const reportStartYMD = toYMD(reportStartDate);
    const selectedMondayYMD = toYMD(selectedMonday);
    const selectedSundayYMD = toYMD(selectedSunday);

    // 보고서의 시작일이 선택된 월~일 주차 범위에 포함되는지 확인
    const isInSelectedWeek =
      reportStartYMD >= selectedMondayYMD &&
      reportStartYMD <= selectedSundayYMD;

    return isInSelectedWeek;
  });

  // 모든 보고서의 데이터를 합친 통합 보고서 생성
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
    router.push(`/create?date=${encodeURIComponent(dateParam)}`);
  };

  // 세부 업무 현황의 모든 담당자 추출 (중복 제거)
  // const allTasks = combinedReport?.projects?.flatMap((project) => project.tasks) || [];
  const assignees = ["담당자"];
  const hasActiveFilters = assigneeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              주간업무보고
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
          {/* Task Table Section - 세부 업무 현황 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                세부 업무 현황
              </h2>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Filter size={16} />
                    <span>필터</span>
                    {hasActiveFilters && (
                      <span className="ml-1 h-5 w-5 rounded-full bg-gray-200 text-xs flex items-center justify-center">
                        {(assigneeFilter !== "all" ? 1 : 0) +
                          (statusFilter !== "all" ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">필터</h4>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssigneeFilter("all");
                            setStatusFilter("all");
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          <X size={12} className="mr-1" />
                          초기화
                        </Button>
                      )}
                    </div>
                    {/* 담당자 필터 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">담당자</label>
                      <Select
                        value={assigneeFilter}
                        onValueChange={setAssigneeFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="담당자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          {assignees.map((assignee) => (
                            <SelectItem key={assignee} value={assignee}>
                              {assignee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* 진행상태 필터 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">진행상태</label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체</SelectItem>
                          <SelectItem value="not-started">시작 전</SelectItem>
                          <SelectItem value="in-progress">진행 중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="delayed">지연</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <TaskTable
              currentReport={combinedReport}
              assigneeFilter={assigneeFilter}
              statusFilter={statusFilter}
            />
          </div>

          {/* Issues and Risks Section - 이슈 및 리스크 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                이슈 및 리스크
              </h2>
            </div>
            <IssuesRisksTable currentReport={combinedReport} />
          </div>

          {/* Next Week Plans Section - 다음주 계획 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                다음주 계획
              </h2>
            </div>
            <NextWeekPlans currentReport={combinedReport} />
          </div>
        </>
      </div>
    </div>
  );
}
