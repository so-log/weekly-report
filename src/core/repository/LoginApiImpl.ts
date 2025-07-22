import { LoginApi } from "./LoginApi";
import { LoginRequestType, LoginResponseType } from "../entity/LoginTypes";

export class LoginApiImpl implements LoginApi {
  async login(request: LoginRequestType): Promise<LoginResponseType> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    return result;
  }
}