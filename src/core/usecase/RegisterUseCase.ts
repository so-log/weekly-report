import { RegisterApi } from "../repository/RegisterApi";
import { RegisterRequestType, RegisterResponseType } from "../entity/RegisterTypes";

export class RegisterUseCase {
  constructor(private registerApi: RegisterApi) {}

  async execute(request: RegisterRequestType): Promise<RegisterResponseType> {
    if (!request.email || !request.password || !request.name) {
      return {
        success: false,
        message: "이메일, 비밀번호, 이름을 모두 입력해주세요."
      };
    }

    if (!this.isValidEmail(request.email)) {
      return {
        success: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    if (request.password.length < 6) {
      return {
        success: false,
        message: "비밀번호는 6자 이상이어야 합니다."
      };
    }

    try {
      return await this.registerApi.register(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다."
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}