import { TeamsResponseType } from "../entity/TeamTypes";

export interface TeamApi {
  getTeams(): Promise<TeamsResponseType>;
}