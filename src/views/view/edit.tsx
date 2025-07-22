"use client";

import { useParams } from "next/navigation";
import EditReportPage from "../component/EditReportPage";

export default function EditPage() {
  const params = useParams();
  const reportId = params.id as string | undefined;

  if (!reportId) {
    return <div>잘못된 접근입니다. (id 없음)</div>;
  }

  return <EditReportPage reportId={reportId} />;
}