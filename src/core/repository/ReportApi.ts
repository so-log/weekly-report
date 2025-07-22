import { 
  CreateReportRequestType, 
  CreateReportResponseType,
  GetReportsRequestType,
  ReportsResponseType 
} from "../entity/ReportTypes";

export interface ReportApi {
  getReports(request: GetReportsRequestType): Promise<ReportsResponseType>;
  getPersonalReports(request: GetReportsRequestType): Promise<ReportsResponseType>;
  createReport(request: CreateReportRequestType): Promise<CreateReportResponseType>;
}