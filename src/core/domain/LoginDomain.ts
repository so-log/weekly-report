import { LoginUseCase } from "../usecase/LoginUseCase";
import { LoginRequestType, LoginResponseType } from "../entity/LoginTypes";

export class LoginDomain {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(request: LoginRequestType): Promise<LoginResponseType> {
    return await this.loginUseCase.execute(request);
  }
}