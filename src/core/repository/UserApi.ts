import { 
  UpdateUserRequestType,
  DeleteUserRequestType,
  UsersResponseType,
  UpdateUserResponseType,
  DeleteUserResponseType
} from "../entity/UserTypes";

export interface UserApi {
  getUsers(): Promise<UsersResponseType>;
  updateUser(request: UpdateUserRequestType): Promise<UpdateUserResponseType>;
  deleteUser(request: DeleteUserRequestType): Promise<DeleteUserResponseType>;
}