import { RegisterRequestType } from "../entity/RegisterTypes";

export class RegisterDomain {
  validateRegisterRequest(request: RegisterRequestType): { isValid: boolean; message?: string } {
    if (!request.email || !request.password || !request.name) {
      return {
        isValid: false,
        message: "이메일, 비밀번호, 이름을 모두 입력해주세요."
      };
    }

    if (!this.isValidEmail(request.email)) {
      return {
        isValid: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    if (request.password.length < 6) {
      return {
        isValid: false,
        message: "비밀번호는 6자 이상이어야 합니다."
      };
    }

    return { isValid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}