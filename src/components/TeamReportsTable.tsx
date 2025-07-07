"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeamReport {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  projects: any[];
}

interface TeamReportsTableProps {
  teamId: string | null;
  selectedDate: Date;
}

export default function TeamReportsTable({
  teamId,
  selectedDate,
}: TeamReportsTableProps) {
  const [reports, setReports] = useState<TeamReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!teamId) {
      setReports([]);
      return;
    }

    const fetchTeamReports = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/teams/${teamId}/reports`);
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (error) {
        console.error("Error fetching team reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamReports();
  }, [teamId]);

  const handleViewReport = (reportId: string) => {
    router.push(`/edit/${reportId}`);
  };

  if (!teamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>팀 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            팀을 선택하면 해당 팀의 보고서를 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>팀 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User size={20} />
            <span>팀 보고서</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            이번 주에 제출된 보고서가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User size={20} />
          <span>팀 보고서 ({reports.length}개)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {report.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {report.user.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {report.user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(report.week_start), "M월 d일", {
                        locale: ko,
                      })}{" "}
                      -{" "}
                      {format(new Date(report.week_end), "M월 d일", {
                        locale: ko,
                      })}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {report.projects.length}개 프로젝트
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <Eye size={14} className="mr-1" />
                    보기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
