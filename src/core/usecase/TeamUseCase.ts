import { TeamDomain } from "../domain/TeamDomain";
import { TeamApi } from "../repository/TeamApi";
import { TeamsResponseType } from "../entity/TeamTypes";

export class TeamUseCase {
  constructor(
    private teamDomain: TeamDomain,
    private teamApi: TeamApi
  ) {}

  async getTeams(): Promise<TeamsResponseType> {
    try {
      return await this.teamApi.getTeams();
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "팀 목록을 불러오는 중 오류가 발생했습니다."
      };
    }
  }
}