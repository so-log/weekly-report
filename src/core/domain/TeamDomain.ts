import { TeamUseCase } from "../usecase/TeamUseCase";
import { TeamsResponseType } from "../entity/TeamTypes";

export class TeamDomain {
  constructor(private teamUseCase: TeamUseCase) {}

  async getTeams(): Promise<TeamsResponseType> {
    return await this.teamUseCase.getTeams();
  }
}