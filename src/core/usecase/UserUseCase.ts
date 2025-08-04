import { UserDomain } from "../domain/UserDomain";
import { UserApi } from "../repository/UserApi";
import { 
  UpdateUserRequestType,
  DeleteUserRequestType,
  UsersResponseType,
  UpdateUserResponseType,
  DeleteUserResponseType
} from "../entity/UserTypes";

export class UserUseCase {
  constructor(
    private userDomain: UserDomain,
    private userApi: UserApi
  ) {}

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
    // 1. 도메인 검증
    const validation = this.userDomain.validateUpdateUserRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message!
      };
    }

    // 2. 실제 사용자 정보 수정 처리
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
    // 1. 도메인 검증
    const validation = this.userDomain.validateDeleteUserRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message!
      };
    }

    // 2. 실제 사용자 삭제 처리
    try {
      return await this.userApi.deleteUser(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "사용자 삭제 중 오류가 발생했습니다."
      };
    }
  }
}