import { TeamApi } from "./TeamApi";
import { TeamsResponseType } from "../entity/TeamTypes";

export class TeamApiImpl implements TeamApi {
  async getTeams(): Promise<TeamsResponseType> {
    const response = await fetch("/api/teams");
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data
      };
    } else {
      return {
        success: false,
        message: "팀 목록을 불러오는 중 오류가 발생했습니다."
      };
    }
  }
}