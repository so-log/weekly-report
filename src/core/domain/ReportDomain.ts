import { CreateReportRequestType } from "../entity/ReportTypes";

export class ReportDomain {
  validateCreateReportRequest(request: CreateReportRequestType): { isValid: boolean; message?: string } {
    if (!request.weekStart || !request.weekEnd) {
      return {
        isValid: false,
        message: "주 시작일과 종료일을 모두 입력해주세요."
      };
    }

    if (!request.projects || request.projects.length === 0) {
      return {
        isValid: false,
        message: "최소 하나의 프로젝트를 추가해주세요."
      };
    }

    // 각 프로젝트가 최소 하나의 작업을 가지는지 확인
    for (const project of request.projects) {
      if (!project.tasks || project.tasks.length === 0) {
        return {
          isValid: false,
          message: `${project.name} 프로젝트에 최소 하나의 작업을 추가해주세요.`
        };
      }
    }

    return { isValid: true };
  }
}