import { UserApi } from "./UserApi";
import { 
  UpdateUserRequestType,
  DeleteUserRequestType,
  UsersResponseType,
  UpdateUserResponseType,
  DeleteUserResponseType
} from "../entity/UserTypes";

export class UserApiImpl implements UserApi {
  private getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getUsers(): Promise<UsersResponseType> {
    try {
      const response = await fetch("/api/users", {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || "사용자 목록을 불러오는 중 오류가 발생했습니다."
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다."
      };
    }
  }

  async updateUser(request: UpdateUserRequestType): Promise<UpdateUserResponseType> {
    try {
      const { id, ...updateData } = request;
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || "사용자 정보 수정 중 오류가 발생했습니다."
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다."
      };
    }
  }

  async deleteUser(request: DeleteUserRequestType): Promise<DeleteUserResponseType> {
    try {
      const response = await fetch(`/api/users/${request.id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: data.success || true,
          message: "사용자가 성공적으로 삭제되었습니다."
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.error || "사용자 삭제 중 오류가 발생했습니다."
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다."
      };
    }
  }
}