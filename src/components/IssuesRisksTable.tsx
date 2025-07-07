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

  if (issuesRisks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            이슈 및 리스크
          </h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p>등록된 이슈가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          이슈 및 리스크
        </h2>
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          {issuesRisks.length}개
        </Badge>
      </div>
      <div className="space-y-4">
        {issuesRisks.map((issueRisk: IssueRisk) => (
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
                  {issueRisk.issueDescription || "내용 없음"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  대응 방안
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  {issueRisk.mitigationPlan || "내용 없음"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
