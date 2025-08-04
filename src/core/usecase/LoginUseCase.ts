import { LoginDomain } from "../domain/LoginDomain";
import { LoginApi } from "../repository/LoginApi";
import { LoginRequestType, LoginResponseType } from "../entity/LoginTypes";

export class LoginUseCase {
  constructor(
    private loginDomain: LoginDomain,
    private loginApi: LoginApi
  ) {}

  async execute(request: LoginRequestType): Promise<LoginResponseType> {
    // 1. 도메인 검증
    const validation = this.loginDomain.validateLoginRequest(request);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message!
      };
    }

    // 2. 실제 로그인 처리
    try {
      return await this.loginApi.login(request);
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다."
      };
    }
  }
}