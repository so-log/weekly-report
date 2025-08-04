import { UpdateUserRequestType, DeleteUserRequestType } from "../entity/UserTypes";

export class UserDomain {
  validateUpdateUserRequest(request: UpdateUserRequestType): { isValid: boolean; message?: string } {
    if (!request.id) {
      return {
        isValid: false,
        message: "사용자 ID가 필요합니다."
      };
    }

    if (request.email && !this.isValidEmail(request.email)) {
      return {
        isValid: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    if (request.name && request.name.trim().length < 2) {
      return {
        isValid: false,
        message: "이름은 2자 이상이어야 합니다."
      };
    }

    return { isValid: true };
  }

  validateDeleteUserRequest(request: DeleteUserRequestType): { isValid: boolean; message?: string } {
    if (!request.id) {
      return {
        isValid: false,
        message: "사용자 ID가 필요합니다."
      };
    }

    return { isValid: true };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}