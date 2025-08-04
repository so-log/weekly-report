import { LoginRequestType } from "../entity/LoginTypes";

export class LoginDomain {
  validateLoginRequest(request: LoginRequestType): { isValid: boolean; message?: string } {
    if (!request.email || !request.password) {
      return {
        isValid: false,
        message: "이메일과 비밀번호를 입력해주세요."
      };
    }

    if (!this.isValidEmail(request.email)) {
      return {
        isValid: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    return { isValid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}