"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import SummaryCards from "@/components/SummaryCards";
import ProjectProgress from "@/components/ProjectProgress";
import TaskTable from "@/components/TaskTable";
import IssuesRisksTable from "@/components/IssuesRisksTable";
import NextWeekPlans from "@/components/NextWeekPlans";
import { ClientReport } from "@/lib/api";
import { format, addDays, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";

interface ReportDetailModalProps {
  report: ClientReport;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportDetailModal({
  report,
  isOpen,
  onClose,
}: ReportDetailModalProps) {
  if (!isOpen) return null;

  // 주간 날짜 범위 계산
  const monday = startOfWeek(report.weekStart, { weekStartsOn: 1 });
  const friday = addDays(monday, 4);
  const formattedRange = `${format(monday, "yyyy년 M월 d일", {
    locale: ko,
  })} - ${format(friday, "yyyy년 M월 d일", { locale: ko })}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {report.user?.name}님의 주간업무보고
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {formattedRange}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <SummaryCards currentReport={report} />

          {/* Project Progress */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                프로젝트 진행률
              </h3>
              <ProjectProgress currentReport={report} />
            </CardContent>
          </Card>

          {/* Task Table */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                세부 업무 현황
              </h3>
              <TaskTable
                currentReport={report}
                assigneeFilter="all"
                statusFilter="all"
              />
            </CardContent>
          </Card>

          {/* Next Week Plans */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                다음주 계획
              </h3>
              <NextWeekPlans currentReport={report} />
            </CardContent>
          </Card>

          {/* Issues and Risks */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                이슈 및 리스크
              </h3>
              <IssuesRisksTable currentReport={report} />
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  );
}
