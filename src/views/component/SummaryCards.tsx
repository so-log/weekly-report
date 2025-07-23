import { CheckCircle, Clock, Briefcase } from "lucide-react";
import type { Report } from "../viewModel/use-reports";

interface SummaryCardsProps {
  currentReport?: Report | null;
}

export default function SummaryCards({ currentReport }: SummaryCardsProps) {
  // 현재 보고서에서 통계 계산
  const totalProjects = currentReport?.projects?.length || 0;

  const totalTasks =
    currentReport?.projects?.reduce(
      (total, project) => total + (project.tasks?.length || 0),
      0
    ) || 0;

  const completedTasks =
    currentReport?.projects?.reduce(
      (total, project) =>
        total +
        (project.tasks?.filter((task) => task.status === "completed").length ||
          0),
      0
    ) || 0;

  const inProgressTasks =
    currentReport?.projects?.reduce(
      (total, project) =>
        total +
        (project.tasks?.filter((task) => task.status === "in-progress")
          .length || 0),
      0
    ) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-start">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <Briefcase className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              전체 프로젝트
            </p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2">
                {totalProjects}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-start">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              완료된 업무
            </p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2">
                {completedTasks}
              </h3>
              <span className="text-gray-500 text-sm">/ {totalTasks}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-start">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <Clock className="h-6 w-6 text-amber-500" />
          </div>
          <div className="ml-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              진행중인 업무
            </p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2">
                {inProgressTasks}
              </h3>
              <span className="text-gray-500 text-sm">/ {totalTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
