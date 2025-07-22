"use client";

import { useState, useEffect } from "react";
import { TeamDomain } from "../../core/domain/TeamDomain";
import { Team } from "../../core/entity/TeamTypes";

export interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
}

export class TeamViewModel {
  private _state: TeamState = {
    teams: [],
    isLoading: false,
    error: null,
  };

  private _setState: React.Dispatch<React.SetStateAction<TeamState>> | null = null;

  constructor(private teamDomain: TeamDomain) {}

  get state(): TeamState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<TeamState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<TeamState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  async loadTeams(): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.teamDomain.getTeams();

      if (response.success && response.data) {
        this.updateState({
          isLoading: false,
          teams: response.data,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "팀 목록을 불러오는 중 오류가 발생했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }
}

export function useTeamViewModel(teamDomain: TeamDomain) {
  const [viewModel] = useState(() => new TeamViewModel(teamDomain));
  const [state, setState] = useState<TeamState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  useEffect(() => {
    viewModel.loadTeams();
  }, [viewModel]);

  return { viewModel, state };
}