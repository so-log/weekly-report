"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Target } from "lucide-react";

interface Task {
  id: string;
  name: string;
  status: string;
  startDate: string;
  dueDate: string;
  notes: string;
  planDetail: string;
  type: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
  tasks: Task[];
}

interface NextWeekPlansProps {
  currentReport: any;
}

export default function NextWeekPlans({ currentReport }: NextWeekPlansProps) {
  // 다음주 계획 업무만 필터링 (type === 'next')
  const nextWeekTasks =
    currentReport?.projects?.flatMap(
      (project: Project) =>
        project.tasks?.filter((task: Task) => task.type === "next") || []
    ) || [];

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
                  className={
                    task.status === "completed"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : task.status === "in-progress"
                      ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400"
                  }
                >
                  {task.status === "completed"
                    ? "완료"
                    : task.status === "in-progress"
                    ? "진행중"
                    : task.status === "not-started"
                    ? "시작전"
                    : "지연"}
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
                    시작일:{" "}
                    {task.startDate ? task.startDate.split("T")[0] : "미정"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    마감일: {task.dueDate ? task.dueDate.split("T")[0] : "미정"}
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
