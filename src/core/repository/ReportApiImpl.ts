import { ReportApi } from "./ReportApi";
import { 
  CreateReportRequestType, 
  CreateReportResponseType,
  GetReportsRequestType,
  ReportsResponseType 
} from "../entity/ReportTypes";

export class ReportApiImpl implements ReportApi {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    const params = new URLSearchParams();
    if (request.startDate) params.append("start_date", request.startDate);
    if (request.endDate) params.append("end_date", request.endDate);
    if (request.teamId) params.append("teamId", request.teamId);

    const response = await fetch(`/api/reports?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  }

  async getPersonalReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    const params = new URLSearchParams();
    if (request.startDate) params.append("start_date", request.startDate);
    if (request.endDate) params.append("end_date", request.endDate);

    const response = await fetch(`/api/reports/personal?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  }

  async createReport(request: CreateReportRequestType): Promise<CreateReportResponseType> {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  }
}