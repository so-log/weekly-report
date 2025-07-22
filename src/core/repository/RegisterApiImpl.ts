import { RegisterApi } from "./RegisterApi";
import { RegisterRequestType, RegisterResponseType } from "../entity/RegisterTypes";

export class RegisterApiImpl implements RegisterApi {
  async register(request: RegisterRequestType): Promise<RegisterResponseType> {
    const response = await fetch("/api/auth/register", {
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