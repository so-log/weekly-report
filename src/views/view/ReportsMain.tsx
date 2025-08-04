"use client";

import { useEffect } from "react";
import { Button } from "../component/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../component/ui/Card";
import { ReportList } from "../component/ReportList";
import { useReportListViewModel } from "../viewmodel/ReportListViewModel";
import { ReportDomain } from "../../core/domain/ReportDomain";
import { ReportUseCase } from "../../core/usecase/ReportUseCase";

interface ReportsMainProps {
  reportApi: any;
}

export function ReportsMain({ reportApi }: ReportsMainProps) {
  const reportDomain = new ReportDomain();
  const reportUseCase = new ReportUseCase(reportDomain, reportApi);
  const { viewModel, state } = useReportListViewModel(reportDomain);

  useEffect(() => {
    viewModel.loadPersonalReports();
  }, [viewModel]);

  const handleRefresh = () => {
    viewModel.loadPersonalReports();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>내 보고서</CardTitle>
            <Button onClick={handleRefresh} disabled={state.isLoading}>
              {state.isLoading ? "로딩 중..." : "새로고침"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ReportList state={state} />
        </CardContent>
      </Card>
    </div>
  );
}