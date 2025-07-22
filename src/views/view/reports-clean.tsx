"use client";

import { ReportsMain } from "../view/ReportsMain";
import { ReportApiImpl } from "../../infrastructure/ReportApiImpl";

export default function ReportsCleanPage() {
  const reportApi = new ReportApiImpl();

  return <ReportsMain reportApi={reportApi} />;
}