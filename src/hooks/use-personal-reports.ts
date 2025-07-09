import { useState, useEffect } from "react";
import { ClientReport } from "@/lib/api";

export function usePersonalReports() {
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPersonalReports = async () => {
      try {
        setLoading(true);

        // 인증 토큰 가져오기
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        const response = await fetch("/api/reports/personal", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "개인 보고서를 불러오는데 실패했습니다."
          );
        }

        const data = await response.json();

        if (data.success && data.data) {
          setReports(data.data);
        } else {
          setReports([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalReports();
  }, []);

  return { reports, loading, error };
}
