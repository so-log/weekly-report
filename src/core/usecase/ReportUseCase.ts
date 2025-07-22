import { ReportApi } from "../repository/ReportApi";
import { 
  CreateReportRequestType, 
  CreateReportResponseType,
  GetReportsRequestType,
  ReportsResponseType 
} from "../entity/ReportTypes";

export class ReportUseCase {
  constructor(private reportApi: ReportApi) {}

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
    if (!request.weekStart || !request.weekEnd) {
      return {
        success: false,
        message: "주 시작일과 종료일을 모두 입력해주세요."
      };
    }

    if (!request.projects || request.projects.length === 0) {
      return {
        success: false,
        message: "최소 하나의 프로젝트를 추가해주세요."
      };
    }

    // 각 프로젝트가 최소 하나의 작업을 가지는지 확인
    for (const project of request.projects) {
      if (!project.tasks || project.tasks.length === 0) {
        return {
          success: false,
          message: `${project.name} 프로젝트에 최소 하나의 작업을 추가해주세요.`
        };
      }
    }

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