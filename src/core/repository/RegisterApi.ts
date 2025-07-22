import { RegisterRequestType, RegisterResponseType } from "../entity/RegisterTypes";

export interface RegisterApi {
  register(request: RegisterRequestType): Promise<RegisterResponseType>;
}