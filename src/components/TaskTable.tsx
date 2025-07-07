import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { Report } from "@/hooks/use-reports";

interface TaskTableProps {
  currentReport?: Report | null;
  assigneeFilter: string;
  statusFilter: string;
}

interface Task {
  id: number;
  name: string;
  assignee: {
    name: string;
    initials: string;
  };
  startDate: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "completed" | "delayed";
  notes: string;
}

export default function TaskTable({
  currentReport,
  assigneeFilter,
  statusFilter,
}: TaskTableProps) {
  // 현재 보고서의 모든 프로젝트에서 태스크들을 수집
  const tasks =
    currentReport?.projects?.flatMap((project, projectIndex) =>
      project.tasks.map((task, taskIndex) => ({
        id: task.id || projectIndex * 100 + taskIndex + 1,
        name: task.name,
        assignee: {
          name: "담당자",
          initials: "담",
        },
        startDate: task.startDate,
        dueDate: task.dueDate,
        status: task.status,
        notes: task.notes,
      }))
    ) || [];

  // 필터 적용
  const filteredTasks = tasks.filter((task) => {
    const assigneeMatch =
      assigneeFilter === "all" || task.assignee.name === assigneeFilter;
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    return assigneeMatch && statusMatch;
  });

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "not-started":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          >
            시작 전
          </Badge>
        );
      case "in-progress":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
          >
            진행 중
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
          >
            완료
          </Badge>
        );
      case "delayed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            지연
          </Badge>
        );
      default:
        return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>등록된 업무가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">업무명</TableHead>
            <TableHead>담당자</TableHead>
            <TableHead>시작일</TableHead>
            <TableHead>완료예정일</TableHead>
            <TableHead>진행상태</TableHead>
            <TableHead className="text-right">비고</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">
                      {task.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {new Date(task.startDate).toLocaleDateString("ko-KR")}
              </TableCell>
              <TableCell>
                {new Date(task.dueDate).toLocaleDateString("ko-KR")}
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell className="text-right text-sm text-gray-500 dark:text-gray-400">
                {task.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
