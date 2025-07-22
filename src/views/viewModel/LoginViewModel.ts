"use client";

import { useState } from "react";
import { LoginDomain } from "../../core/domain/LoginDomain";
import { LoginRequestType } from "../../core/entity/LoginTypes";

export interface LoginState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
}

export class LoginViewModel {
  private _state: LoginState = {
    email: "",
    password: "",
    isLoading: false,
    error: null,
    isLoggedIn: false,
  };

  private _setState: React.Dispatch<React.SetStateAction<LoginState>> | null = null;

  constructor(private loginDomain: LoginDomain) {}

  get state(): LoginState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<LoginState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<LoginState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  updateEmail(email: string): void {
    this.updateState({ email, error: null });
  }

  updatePassword(password: string): void {
    this.updateState({ password, error: null });
  }

  async login(): Promise<void> {
    if (this._state.isLoading) return;

    this.updateState({ isLoading: true, error: null });

    const request: LoginRequestType = {
      email: this._state.email,
      password: this._state.password,
    };

    try {
      const response = await this.loginDomain.login(request);

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        this.updateState({ 
          isLoading: false, 
          isLoggedIn: true,
          error: null 
        });
      } else {
        this.updateState({ 
          isLoading: false, 
          error: response.message || "로그인에 실패했습니다." 
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

export function useLoginViewModel(loginDomain: LoginDomain) {
  const [viewModel] = useState(() => new LoginViewModel(loginDomain));
  const [state, setState] = useState<LoginState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  return { viewModel, state };
}