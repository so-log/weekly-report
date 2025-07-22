import { LoginRequestType, LoginResponseType } from "../entity/LoginTypes";

export interface LoginApi {
  login(request: LoginRequestType): Promise<LoginResponseType>;
}