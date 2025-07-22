import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import type { Report } from "@/hooks/use-reports";

interface ProjectProgressProps {
  currentReport?: Report | null;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  status: "in-progress" | "completed" | "delayed";
}

export default function ProjectProgress({
  currentReport,
}: ProjectProgressProps) {
  // 현재 보고서의 프로젝트 데이터만 사용
  const projects =
    currentReport?.projects?.map((project, index) => ({
      id: project.id || `project-${index}`,
      name: project.name || "프로젝트명 없음",
      progress: project.progress || 0,
      status: project.status || "in-progress",
    })) || [];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "delayed":
        return "text-red-500";
      case "in-progress":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return "완료";
      case "delayed":
        return "지연";
      case "in-progress":
        return "진행중";
      default:
        return "";
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>등록된 프로젝트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              {project.name}
            </h3>
            <span
              className={`text-xs font-medium ${getStatusColor(
                project.status
              )}`}
            >
              {getStatusText(project.status)}
            </span>
          </div>

          <div className="relative pt-1 mb-4">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                  진행률
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                  {project.progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
              <div
                style={{ width: `${project.progress}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  project.status === "completed"
                    ? "bg-green-500"
                    : project.status === "delayed"
                    ? "bg-red-500"
                    : "bg-blue-500"
                }`}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>프로젝트 ID: {project.id}</p>
            </div>
            <Avatar>
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
          </div>
        </div>
      ))}
    </div>
  );
}
