import { LoginApi } from "../repository/LoginApi";
import { LoginRequestType, LoginResponseType } from "../entity/LoginTypes";

export class LoginUseCase {
  constructor(private loginApi: LoginApi) {}

  async execute(request: LoginRequestType): Promise<LoginResponseType> {
    if (!request.email || !request.password) {
      return {
        success: false,
        message: "이메일과 비밀번호를 입력해주세요."
      };
    }

    if (!this.isValidEmail(request.email)) {
      return {
        success: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    try {
      return await this.loginApi.login(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다."
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}