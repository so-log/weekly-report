"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Calendar, Target } from "lucide-react";
import type { ClientReport, Project, Task } from "../../core/entity/ApiTypes";

interface NextWeekPlansProps {
  currentReport: ClientReport | null;
}

// 상태별 스타일 상수
const STATUS_STYLES = {
  completed: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  "in-progress": "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  "not-started": "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
  delayed: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
} as const;

// 상태 라벨 상수
const STATUS_LABELS = {
  completed: "완료",
  "in-progress": "진행중",
  "not-started": "시작전",
  delayed: "지연",
} as const;

// 유틸리티 함수들
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "미정";
  return dateString.split("T")[0];
};

const getStatusStyle = (status: Task["status"]): string => {
  return STATUS_STYLES[status] || STATUS_STYLES["not-started"];
};

const getStatusLabel = (status: Task["status"]): string => {
  return STATUS_LABELS[status] || "알 수 없음";
};

const extractNextWeekTasks = (report: ClientReport | null): Task[] => {
  return report?.projects?.flatMap(
    (project: Project) =>
      project.tasks?.filter((task: Task) => task.type === "next") || []
  ) || [];
};

export default function NextWeekPlans({ currentReport }: NextWeekPlansProps) {
  // 메모이제이션된 다음주 계획 업무 필터링
  const nextWeekTasks = useMemo(
    () => extractNextWeekTasks(currentReport),
    [currentReport]
  );

  if (nextWeekTasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p>다음주 계획이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
        >
          {nextWeekTasks.length}개 업무
        </Badge>
      </div>

      <div className="grid gap-4">
        {nextWeekTasks.map((task: Task) => (
          <Card key={task.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{task.name}</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className={getStatusStyle(task.status)}
                >
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {task.planDetail && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    계획 상세
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {task.planDetail}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    시작일: {formatDate(task.startDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    마감일: {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>

              {task.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    비고
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    {task.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
