import { UserApi } from "../repository/UserApi";
import { 
  UpdateUserRequestType,
  DeleteUserRequestType,
  UsersResponseType,
  UpdateUserResponseType,
  DeleteUserResponseType
} from "../entity/UserTypes";

export class UserUseCase {
  constructor(private userApi: UserApi) {}

  async getUsers(): Promise<UsersResponseType> {
    try {
      return await this.userApi.getUsers();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "사용자 목록을 불러오는 중 오류가 발생했습니다."
      };
    }
  }

  async updateUser(request: UpdateUserRequestType): Promise<UpdateUserResponseType> {
    if (!request.id) {
      return {
        success: false,
        message: "사용자 ID가 필요합니다."
      };
    }

    if (request.email && !this.isValidEmail(request.email)) {
      return {
        success: false,
        message: "올바른 이메일 형식이 아닙니다."
      };
    }

    if (request.name && request.name.trim().length < 2) {
      return {
        success: false,
        message: "이름은 2자 이상이어야 합니다."
      };
    }

    try {
      return await this.userApi.updateUser(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "사용자 정보 수정 중 오류가 발생했습니다."
      };
    }
  }

  async deleteUser(request: DeleteUserRequestType): Promise<DeleteUserResponseType> {
    if (!request.id) {
      return {
        success: false,
        message: "사용자 ID가 필요합니다."
      };
    }

    try {
      return await this.userApi.deleteUser(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "사용자 삭제 중 오류가 발생했습니다."
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}