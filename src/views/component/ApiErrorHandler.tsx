"use client";

import { useEffect } from "react";
import { useToast } from "../viewModel/use-toast";
import { ApiError } from "../../infrastructure/api/ApiClient";

interface ApiErrorHandlerProps {
  error: Error | null;
  showToast?: boolean;
}

export default function ApiErrorHandler({
  error,
  showToast = true,
}: ApiErrorHandlerProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (error && showToast) {
      let title = "오류 발생";
      let description = "알 수 없는 오류가 발생했습니다.";

      if (error instanceof ApiError) {
        switch (error.status) {
          case 401:
            title = "인증 오류";
            description = "로그인이 필요합니다.";
            break;
          case 403:
            title = "권한 오류";
            description = "접근 권한이 없습니다.";
            break;
          case 404:
            title = "데이터 없음";
            description = "요청한 데이터를 찾을 수 없습니다.";
            break;
          case 500:
            title = "서버 오류";
            description = "서버에서 오류가 발생했습니다.";
            break;
          default:
            description = error.message;
        }
      } else {
        description = error.message;
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    }
  }, [error, showToast, toast]);

  return null;
}
