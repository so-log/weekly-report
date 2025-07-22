import { RegisterUseCase } from "../usecase/RegisterUseCase";
import { RegisterRequestType, RegisterResponseType } from "../entity/RegisterTypes";

export class RegisterDomain {
  constructor(private registerUseCase: RegisterUseCase) {}

  async register(request: RegisterRequestType): Promise<RegisterResponseType> {
    return await this.registerUseCase.execute(request);
  }
}