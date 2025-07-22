"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../component/ui/Button";

// 임시로 빈 훅 함수 생성 (나중에 viewModel로 대체)
function useReports() {
  return {
    reports: [],
    loading: false,
    deleteReport: async (id: string) => {},
    refreshReports: async () => {}
  };
}

export default function MyReportsPage() {
  const { reports, loading, deleteReport, refreshReports } = useReports();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말로 이 보고서를 삭제하시겠습니까?")) return;
    setDeletingId(id);
    try {
      await deleteReport(id);
      await refreshReports();
    } finally {
      setDeletingId(null);
    }
  };

  if (!mounted || loading) {
    return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        작성한 보고서가 없습니다.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">내 보고서</h1>
      <div className="space-y-4">
        {reports.map((report: any) => (
          <div
            key={report.id}
            className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div>
              <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {report.projects[0]?.name || "(프로젝트명 없음)"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(report.weekStart).toLocaleDateString("ko-KR")} ~{" "}
                {new Date(report.weekEnd).toLocaleDateString("ko-KR")}
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => router.push(`/edit/${report.id}`)}
                className="flex items-center space-x-1"
              >
                <span>수정</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={deletingId === report.id}
                onClick={() => handleDelete(report.id)}
                className="flex items-center space-x-1"
              >
                <span>{deletingId === report.id ? "삭제 중..." : "삭제"}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}