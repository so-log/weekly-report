import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import type { Report } from "@/hooks/use-reports";

interface ProjectProgressProps {
  currentReport?: Report | null;
}

interface Project {
  id: number;
  name: string;
  progress: number;
  startDate: string;
  endDate: string;
  assignee: {
    name: string;
    initials: string;
  };
  status: "on-track" | "at-risk" | "delayed";
}

export default function ProjectProgress({
  currentReport,
}: ProjectProgressProps) {
  // 현재 보고서의 프로젝트 데이터만 사용
  const projects =
    currentReport?.projects?.map((project, index) => ({
      id: project.id || index + 1,
      name: project.name || "프로젝트명 없음",
      progress: project.progress || 0,
      startDate: new Date().toISOString().split("T")[0], // 임시 날짜
      endDate: new Date().toISOString().split("T")[0], // 임시 날짜
      assignee: {
        name: "담당자",
        initials: "담",
      },
      status: project.status || "on-track",
    })) || [];

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "on-track":
        return "text-green-500";
      case "at-risk":
        return "text-amber-500";
      case "delayed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "on-track":
        return "정상";
      case "at-risk":
        return "위험";
      case "delayed":
        return "지연";
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
                  project.status === "on-track"
                    ? "bg-green-500"
                    : project.status === "at-risk"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p>
                시작일:{" "}
                {new Date(project.startDate).toLocaleDateString("ko-KR")}
              </p>
              <p>
                종료일: {new Date(project.endDate).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <Avatar>
              <AvatarFallback>{project.assignee.initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      ))}
    </div>
  );
}
