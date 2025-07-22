"use client";

import { useState } from "react";
import { UserDomain } from "../../core/domain/UserDomain";
import { UserDetail, UpdateUserRequestType, DeleteUserRequestType } from "../../core/entity/UserTypes";

export interface UserListState {
  users: UserDetail[];
  isLoading: boolean;
  error: string | null;
}

export class UserListViewModel {
  private _state: UserListState = {
    users: [],
    isLoading: false,
    error: null,
  };

  private _setState: React.Dispatch<React.SetStateAction<UserListState>> | null = null;

  constructor(private userDomain: UserDomain) {}

  get state(): UserListState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<UserListState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<UserListState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  async loadUsers(): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    try {
      const response = await this.userDomain.getUsers();

      if (response.success && response.data) {
        this.updateState({
          isLoading: false,
          users: response.data,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "사용자 목록을 불러오는 중 오류가 발생했습니다."
        });
      }
    } catch (error) {
      this.updateState({
        isLoading: false,
        error: "네트워크 오류가 발생했습니다."
      });
    }
  }

  async updateUser(request: UpdateUserRequestType): Promise<boolean> {
    try {
      const response = await this.userDomain.updateUser(request);

      if (response.success && response.data) {
        // 로컬 state 업데이트
        const users = this._state.users.map(user => 
          user.id === request.id ? response.data! : user
        );
        this.updateState({ users });
        return true;
      } else {
        this.updateState({
          error: response.message || "사용자 정보 수정 중 오류가 발생했습니다."
        });
        return false;
      }
    } catch (error) {
      this.updateState({
        error: "네트워크 오류가 발생했습니다."
      });
      return false;
    }
  }

  async deleteUser(request: DeleteUserRequestType): Promise<boolean> {
    try {
      const response = await this.userDomain.deleteUser(request);

      if (response.success) {
        // 로컬 state에서 사용자 제거
        const users = this._state.users.filter(user => user.id !== request.id);
        this.updateState({ users });
        return true;
      } else {
        this.updateState({
          error: response.message || "사용자 삭제 중 오류가 발생했습니다."
        });
        return false;
      }
    } catch (error) {
      this.updateState({
        error: "네트워크 오류가 발생했습니다."
      });
      return false;
    }
  }

  clearError(): void {
    this.updateState({ error: null });
  }
}

export function useUserListViewModel(userDomain: UserDomain) {
  const [viewModel] = useState(() => new UserListViewModel(userDomain));
  const [state, setState] = useState<UserListState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  return { viewModel, state };
}