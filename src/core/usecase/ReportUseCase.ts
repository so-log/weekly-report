import { ReportDomain } from "../domain/ReportDomain";
import { ReportApi } from "../repository/ReportApi";
import { 
  CreateReportRequestType, 
  CreateReportResponseType,
  GetReportsRequestType,
  ReportsResponseType 
} from "../entity/ReportTypes";

export class ReportUseCase {
  constructor(
    private reportDomain: ReportDomain,
    private reportApi: ReportApi
  ) {}

  async getReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    try {
      return await this.reportApi.getReports(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "보고서를 불러오는 중 오류가 발생했습니다."
      };
    }
  }

  async getPersonalReports(request: GetReportsRequestType): Promise<ReportsResponseType> {
    try {
      return await this.reportApi.getPersonalReports(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "개인 보고서를 불러오는 중 오류가 발생했습니다."
      };
    }
  }

  async createReport(request: CreateReportRequestType): Promise<CreateReportResponseType> {
    // 1. 도메인 검증
    const validation = this.reportDomain.validateCreateReportRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message!
      };
    }

    // 2. 실제 보고서 생성 처리
    try {
      return await this.reportApi.createReport(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "보고서 생성 중 오류가 발생했습니다."
      };
    }
  }
}