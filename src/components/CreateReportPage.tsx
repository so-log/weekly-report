"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Plus, X, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/use-reports";
import { format, addDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { ClientReport, Project, Task, IssueRisk } from "@/lib/api";

// Extended Task interface for the component
interface ExtendedTask extends Task {
  type: "current" | "next";
  planDetail?: string;
}

// Extended Project interface for the component
interface ExtendedProject extends Project {
  tasks: ExtendedTask[];
}

// Extended ClientReport interface for the component
interface ExtendedClientReport extends Omit<ClientReport, "projects"> {
  projects: ExtendedProject[];
}

interface CreateReportPageProps {
  editMode?: boolean;
  initialReport?: ExtendedClientReport | null;
  reportId?: string | null;
}

export default function CreateReportPage({
  editMode = false,
  initialReport = null,
  reportId = null,
}: CreateReportPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { createReport, updateReport } = useReports();

  // URL 파라미터에서 날짜를 받아오거나 현재 날짜 사용
  const [selectedDate] = useState<Date>(() => {
    if (editMode && initialReport) {
      // 편집 모드: 기존 보고서의 시작일 사용
      const reportStartDate = new Date(initialReport.weekStart);

      return reportStartDate;
    } else {
      // 생성 모드: URL 파라미터 또는 현재 날짜 사용
      const dateParam = searchParams.get("date");
      if (dateParam) {
        const parsedDate = new Date(dateParam);

        return parsedDate;
      } else {
        const today = new Date();

        return today;
      }
    }
  });
  const [projects, setProjects] = useState<ExtendedProject[]>(() => {
    if (editMode && initialReport) {
      return (initialReport.projects || []).map((project: ExtendedProject) => ({
        ...project,
        tasks: (project.tasks || []).map((task: ExtendedTask) => ({
          ...task,
          startDate: task.startDate
            ? format(new Date(task.startDate), "yyyy-MM-dd")
            : "",
          dueDate: task.dueDate
            ? format(new Date(task.dueDate), "yyyy-MM-dd")
            : "",
          // 기존 데이터에 type 필드가 없으면 기본값 "current"로 설정
          type: task.type || "current",
          planDetail: task.planDetail || "",
        })),
      }));
    }
    return [];
  });

  const [issuesRisks, setIssuesRisks] = useState<IssueRisk[]>(
    editMode && initialReport ? initialReport.issuesRisks || [] : []
  );

  const [isLoading, setIsLoading] = useState(false);

  // 주간 날짜 범위 계산 - 더 간단한 버전
  const getWeekStart = (date: Date) => {
    // 브라우저의 로컬 시간대로 처리 (startDate와 동일한 방식)
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

  const monday = getWeekStart(selectedDate);
  const friday = addDays(monday, 4);
  const formattedRange = `${format(monday, "yyyy년 M월 d일", {
    locale: ko,
  })} - ${format(friday, "yyyy년 M월 d일", { locale: ko })}`;

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      progress: 0,
      status: "in-progress",
      tasks: [],
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const addTask = (projectId: string, type: "current" | "next") => {
    // 다음주 계획인 경우 다른 날짜 설정
    let defaultStartDate: string;
    let defaultDueDate: string;

    if (type === "next") {
      // 다음주 월요일 (현재 선택된 날짜 + 7일 후의 주 월요일)
      const nextWeekMonday = addDays(monday, 7);
      // 다음주 금요일 (다음주 월요일 + 4일)
      const nextWeekFriday = addDays(nextWeekMonday, 4);

      defaultStartDate = format(nextWeekMonday, "yyyy-MM-dd");
      defaultDueDate = format(nextWeekFriday, "yyyy-MM-dd");
    } else {
      // 현재 주 계획
      defaultStartDate = format(monday, "yyyy-MM-dd");
      defaultDueDate = format(friday, "yyyy-MM-dd");
    }

    const newTask: Task = {
      id: Date.now().toString(),
      name: "",
      status: "not-started",
      startDate: defaultStartDate,
      dueDate: defaultDueDate,
      notes: "",
      planDetail: "",
      type,
    };
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      )
    );
  };

  const updateTask = (
    projectId: string,
    taskId: string,
    updates: Partial<Task>
  ) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : project
      )
    );
  };

  const removeTask = (projectId: string, taskId: string) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.filter((task) => task.id !== taskId),
            }
          : project
      )
    );
  };

  const addIssueRisk = () => {
    const newIssueRisk: IssueRisk = {
      id: Date.now().toString(),
      issueDescription: "",
      mitigationPlan: "",
    };
    setIssuesRisks([...issuesRisks, newIssueRisk]);
  };

  const updateIssueRisk = (id: string, updates: Partial<IssueRisk>) => {
    setIssuesRisks(
      issuesRisks.map((issueRisk) =>
        issueRisk.id === id ? { ...issueRisk, ...updates } : issueRisk
      )
    );
  };

  const removeIssueRisk = (id: string) => {
    setIssuesRisks(issuesRisks.filter((issueRisk) => issueRisk.id !== id));
  };

  // 변경된 데이터만 감지하는 함수
  const getChangedData = () => {
    if (!editMode || !initialReport) {
      return { projects, issuesRisks };
    }

    // 프로젝트 변경 감지 (더 정확한 비교)
    const normalizeData = (data: unknown) => {
      return JSON.stringify(data, (key, value) => {
        // id 필드 제외하고 비교 (id는 매번 새로 생성되므로)
        if (key === "id") return undefined;
        return value;
      });
    };

    const projectsChanged =
      normalizeData(projects) !== normalizeData(initialReport.projects || []);

    // 이슈/리스크 변경 감지 (초기 데이터에 issuesRisks가 없을 수 있음)
    const initialIssuesRisks = initialReport.issuesRisks || [];
    const issuesRisksChanged =
      normalizeData(issuesRisks) !== normalizeData(initialIssuesRisks);

    console.log("프로젝트 변경됨:", projectsChanged);
    console.log("이슈/리스크 변경됨:", issuesRisksChanged);
    console.log(
      "정규화된 프로젝트 비교:",
      normalizeData(projects) === normalizeData(initialReport.projects || [])
    );

    return {
      projects: projectsChanged ? projects : [],
      issuesRisks: issuesRisksChanged ? issuesRisks : [],
    };
  };

  const handleSave = async () => {
    if (projects.length === 0) {
      toast({
        title: "저장 실패",
        description: "최소 하나의 프로젝트를 추가해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // 모든 프로젝트/업무의 날짜 필드 빈 문자열을 null로 변환 (API 호출용)
    const safeProjects = projects.map((project) => ({
      ...project,
      tasks: project.tasks.map((task) => ({
        ...task,
        startDate: task.startDate === "" ? null : task.startDate,
        dueDate: task.dueDate === "" ? null : task.dueDate,
      })),
    }));

    try {
      if (editMode && reportId) {
        // 편집 모드: 변경된 데이터만 전송
        const changedData = getChangedData();
        console.log("변경된 데이터:", changedData);
        console.log("프로젝트 변경됨:", changedData.projects.length > 0);
        console.log("이슈/리스크 변경됨:", changedData.issuesRisks.length > 0);
        console.log("초기 프로젝트:", initialReport?.projects);
        console.log("현재 프로젝트:", projects);
        console.log("초기 이슈:", initialReport?.issuesRisks);
        console.log("현재 이슈:", issuesRisks);
        console.log("전체 초기 데이터:", initialReport);
        await updateReport(reportId, {
          ...changedData,
          updatedAt: new Date(),
        });

        toast({
          title: "수정 완료",
          description: "주간업무보고가 성공적으로 수정되었습니다.",
        });
      } else {
        // 생성 모드: 새 보고서 생성
        // 선택된 날짜가 속한 주의 월요일부터 금요일까지 계산
        const weekStart = getWeekStart(selectedDate);
        const weekEnd = addDays(weekStart, 4);
        weekEnd.setHours(23, 59, 59, 999);

        await createReport({
          weekStart: weekStart,
          weekEnd: weekEnd,
          projects: safeProjects as Project[],
          issuesRisks,
        });

        toast({
          title: "저장 완료",
          description: "주간업무보고가 성공적으로 저장되었습니다.",
        });
      }

      router.push("/");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: editMode ? "수정 실패" : "저장 실패",
        description: editMode
          ? "보고서 수정 중 오류가 발생했습니다."
          : "보고서 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {editMode ? "주간업무보고 수정" : "주간업무보고 작성"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {editMode && initialReport
                ? `${initialReport.weekStart.toLocaleDateString(
                    "ko-KR"
                  )} - ${initialReport.weekEnd.toLocaleDateString("ko-KR")}`
                : formattedRange}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>돌아가기</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save size={16} />
              <span>
                {isLoading
                  ? editMode
                    ? "수정 중..."
                    : "저장 중..."
                  : editMode
                  ? "수정 완료"
                  : "저장"}
              </span>
            </Button>
          </div>
        </div>

        {/* Projects Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>프로젝트 관리</CardTitle>
              <Button
                onClick={addProject}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>프로젝트 추가</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {(projects || []).map((project) => (
              <div key={project.id} className="mb-8">
                {/* 프로젝트 정보 입력 박스 */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-12 gap-2 mb-2 items-center">
                    <div className="col-span-6 text-sm font-semibold text-gray-700">
                      프로젝트 이름
                    </div>
                    <div className="col-span-4 text-sm font-semibold text-gray-700">
                      진행률
                    </div>
                    <div className="col-span-2 text-sm font-semibold text-gray-700">
                      상태
                    </div>
                    <div className="col-span-1" />
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-center mb-0">
                    <Input
                      placeholder="프로젝트 이름을 입력하세요"
                      value={project.name}
                      onChange={(e) =>
                        updateProject(project.id, { name: e.target.value })
                      }
                      className="col-span-6 min-w-0"
                    />
                    <div className="col-span-3 flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={project.progress}
                        onChange={(e) =>
                          updateProject(project.id, {
                            progress: Number(e.target.value),
                          })
                        }
                        className="w-60 accent-blue-600"
                      />
                      <span className="w-10 text-right text-sm font-medium">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={project.status}
                        onValueChange={(value) =>
                          updateProject(project.id, {
                            status: value as Project["status"],
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-progress">진행중</SelectItem>
                          <SelectItem value="completed">완료</SelectItem>
                          <SelectItem value="delayed">지연</SelectItem>
                          <SelectItem value="on-hold">보류</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeProject(project.id)}
                      className="col-span-1 ml-auto"
                    >
                      <X size={18} />
                    </Button>
                  </div>
                </div>
                {/* 업무 목록/업무 추가 박스 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">업무 목록</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTask(project.id, "current")}
                      className="ml-2 flex items-center space-x-1"
                    >
                      <Plus size={14} />
                      <span className="ml-1">업무 추가</span>
                    </Button>
                  </div>
                  {(project.tasks || [])
                    .filter((t) => t.type === "current")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-1 md:grid-cols-8 gap-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded items-center"
                      >
                        <Input
                          placeholder="업무명"
                          value={task.name}
                          onChange={(e) =>
                            updateTask(project.id, task.id, {
                              name: e.target.value,
                            })
                          }
                          className="md:col-span-3 w-full min-w-0"
                        />
                        <Select
                          value={task.status}
                          onValueChange={(
                            value:
                              | "not-started"
                              | "in-progress"
                              | "completed"
                              | "delayed"
                          ) =>
                            updateTask(project.id, task.id, { status: value })
                          }
                        >
                          <SelectTrigger className="md:col-span-1 w-full min-w-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">시작 전</SelectItem>
                            <SelectItem value="in-progress">진행 중</SelectItem>
                            <SelectItem value="completed">완료</SelectItem>
                            <SelectItem value="delayed">지연</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="md:col-span-2 flex gap-x-2 min-w-0">
                          <Input
                            type="date"
                            value={task.startDate}
                            onChange={(e) =>
                              updateTask(project.id, task.id, {
                                startDate: e.target.value,
                              })
                            }
                            className="w-36 min-w-0"
                          />
                          <Input
                            type="date"
                            value={task.dueDate}
                            onChange={(e) =>
                              updateTask(project.id, task.id, {
                                dueDate: e.target.value,
                              })
                            }
                            className="w-36 min-w-0"
                          />
                        </div>
                        <Input
                          placeholder="비고"
                          value={task.notes}
                          onChange={(e) =>
                            updateTask(project.id, task.id, {
                              notes: e.target.value,
                            })
                          }
                          className="md:col-span-1 w-full min-w-0"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTask(project.id, task.id)}
                          className="w-8 h-8 p-0 md:col-span-1 min-w-0 ml-2"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Issues and Risks Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>이슈 및 리스크</CardTitle>
              <Button
                onClick={addIssueRisk}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>이슈 추가</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(issuesRisks || []).map((issueRisk) => (
              <div
                key={issueRisk.id}
                className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        발생한 문제
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIssueRisk(issueRisk.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="발생한 문제를 입력하세요"
                      value={issueRisk.issueDescription}
                      onChange={(e) =>
                        updateIssueRisk(issueRisk.id, {
                          issueDescription: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    대응 방안
                  </label>
                  <Textarea
                    placeholder="대응 방안을 입력하세요"
                    value={issueRisk.mitigationPlan}
                    onChange={(e) =>
                      updateIssueRisk(issueRisk.id, {
                        mitigationPlan: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Week Plan Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>다음주 계획</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  // 첫 번째 프로젝트에 추가(혹은 projects[0] 없으면 새 프로젝트 생성)
                  if (projects.length === 0) {
                    addProject();
                  }
                  const targetId = projects[0]?.id;
                  if (targetId) addTask(targetId, "next");
                }}
                className="flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>업무 추가</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(projects || []).flatMap((project) =>
              (project.tasks || [])
                .filter((t) => t.type === "next")
                .map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 items-center"
                  >
                    <Input
                      placeholder="업무항목"
                      value={task.name}
                      onChange={(e) =>
                        updateTask(project.id, task.id, {
                          name: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="계획상세"
                      value={task.planDetail || ""}
                      onChange={(e) =>
                        updateTask(project.id, task.id, {
                          planDetail: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="date"
                      placeholder="시작일"
                      value={task.startDate || ""}
                      onChange={(e) =>
                        updateTask(project.id, task.id, {
                          startDate: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                    <Input
                      type="date"
                      placeholder="마감일"
                      value={task.dueDate || ""}
                      onChange={(e) =>
                        updateTask(project.id, task.id, {
                          dueDate: e.target.value,
                        })
                      }
                      className="w-32"
                    />
                    <div></div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTask(project.id, task.id)}
                      className="w-8 h-8 p-0 ml-2"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
