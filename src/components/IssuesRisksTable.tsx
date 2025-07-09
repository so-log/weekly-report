"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface IssueRisk {
  id: string;
  issueDescription: string;
  mitigationPlan: string;
}

interface IssuesRisksTableProps {
  currentReport: any;
}

export default function IssuesRisksTable({
  currentReport,
}: IssuesRisksTableProps) {
  const issuesRisks = currentReport?.issuesRisks || [];

  // 이슈가 없거나 모든 이슈의 설명이 비어있으면 렌더링하지 않음
  if (issuesRisks.length === 0) {
    return null;
  }

  // 실제 내용이 있는 이슈만 필터링
  const validIssuesRisks = issuesRisks.filter(
    (issue: IssueRisk) =>
      issue.issueDescription && issue.issueDescription.trim() !== ""
  );

  // 유효한 이슈가 없으면 렌더링하지 않음
  if (validIssuesRisks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          {validIssuesRisks.length}개 업무
        </Badge>
      </div>

      <div className="space-y-4">
        {validIssuesRisks.map((issueRisk: IssueRisk) => (
          <Card key={issueRisk.id} className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">이슈</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  발생한 문제
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {issueRisk.issueDescription}
                </p>
              </div>
              {issueRisk.mitigationPlan &&
                issueRisk.mitigationPlan.trim() !== "" && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      대응 방안
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      {issueRisk.mitigationPlan}
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
