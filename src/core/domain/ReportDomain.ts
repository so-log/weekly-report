import { ReportUseCase } from "../usecase/ReportUseCase";
import { 
  CreateReportRequestType, 
  CreateReportResponseType,
  GetReportsRequestType,
  ReportsResponseType 
} from "../entity/ReportTypes";

export class ReportDomain {
  constructor(private reportUseCase: ReportUseCase) {}

  async getReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    return await this.reportUseCase.getReports(request);
  }

  async getPersonalReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    return await this.reportUseCase.getPersonalReports(request);
  }

  async createReport(request: CreateReportRequestType): Promise<CreateReportResponseType> {
    return await this.reportUseCase.createReport(request);
  }
}