import { UserUseCase } from "../usecase/UserUseCase";
import { 
  UpdateUserRequestType,
  DeleteUserRequestType,
  UsersResponseType,
  UpdateUserResponseType,
  DeleteUserResponseType
} from "../entity/UserTypes";

export class UserDomain {
  constructor(private userUseCase: UserUseCase) {}

  async getUsers(): Promise<UsersResponseType> {
    return await this.userUseCase.getUsers();
  }

  async updateUser(request: UpdateUserRequestType): Promise<UpdateUserResponseType> {
    return await this.userUseCase.updateUser(request);
  }

  async deleteUser(request: DeleteUserRequestType): Promise<DeleteUserResponseType> {
    return await this.userUseCase.deleteUser(request);
  }
}