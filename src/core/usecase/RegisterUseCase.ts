import { RegisterDomain } from "../domain/RegisterDomain";
import { RegisterApi } from "../repository/RegisterApi";
import { RegisterRequestType, RegisterResponseType } from "../entity/RegisterTypes";

export class RegisterUseCase {
  constructor(
    private registerDomain: RegisterDomain,
    private registerApi: RegisterApi
  ) {}

  async execute(request: RegisterRequestType): Promise<RegisterResponseType> {
    // 1. 도메인 검증
    const validation = this.registerDomain.validateRegisterRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message!
      };
    }

    // 2. 실제 회원가입 처리
    try {
      return await this.registerApi.register(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다."
      };
    }
  }
}