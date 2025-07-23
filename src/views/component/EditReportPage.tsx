"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../viewModel/use-toast";
import { useReports } from "../viewModel/use-reports";
import CreateReportPage from "./CreateReportPage";

interface EditReportPageProps {
  reportId: string;
}

export default function EditReportPage({ reportId }: EditReportPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { getReport, updateReport } = useReports();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const reportData = await getReport(reportId);

        if (reportData) {
          setReport(reportData);
        } else {
          toast({
            title: "로드 실패",
            description: "보고서를 찾을 수 없습니다.",
            variant: "destructive",
          });
          router.push("/");
        }
      } catch (error) {
        toast({
          title: "로드 실패",
          description: "보고서를 불러올 수 없습니다.",
          variant: "destructive",
        });
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            보고서를 찾을 수 없습니다
          </h2>
          <Button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>돌아가기</span>
          </Button>
        </div>
      </div>
    );
  }

  // CreateReportPage를 편집 모드로 렌더링
  return (
    <CreateReportPage
      editMode={true}
      initialReport={report}
      reportId={reportId}
    />
  );
}
