"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ReportListState } from "../viewmodel/ReportListViewModel";
import { Report } from "../../core/entity/ReportTypes";

interface ReportListProps {
  state: ReportListState;
}

export function ReportList({ state }: ReportListProps) {
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="text-red-600 text-center p-4">
        {state.error}
      </div>
    );
  }

  if (state.reports.length === 0) {
    return (
      <div className="text-gray-500 text-center p-8">
        보고서가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {state.reports.map((report: Report) => (
        <Card key={report.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{report.weekStart} - {report.weekEnd}</span>
              <Badge variant="outline">
                {report.projects?.length || 0}개 프로젝트
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.projects?.slice(0, 3).map((project, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="font-medium">{project.name}</span>
                  <Badge variant={project.status === "완료" ? "default" : "secondary"}>
                    {project.progress}%
                  </Badge>
                </div>
              ))}
              {report.projects && report.projects.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{report.projects.length - 3}개 더
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}