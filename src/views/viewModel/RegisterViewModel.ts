"use client";

import { useState } from "react";
import { RegisterDomain } from "../../core/domain/RegisterDomain";
import { RegisterRequestType } from "../../core/entity/RegisterTypes";

export interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  teamId: string;
}

export interface RegisterState {
  form: RegisterFormState;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean;
}

export class RegisterViewModel {
  private _state: RegisterState = {
    form: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      teamId: "none",
    },
    isLoading: false,
    error: null,
    isRegistered: false,
  };

  private _setState: React.Dispatch<React.SetStateAction<RegisterState>> | null = null;

  constructor(private registerDomain: RegisterDomain) {}

  get state(): RegisterState {
    return this._state;
  }

  init(setState: React.Dispatch<React.SetStateAction<RegisterState>>): void {
    this._setState = setState;
  }

  private updateState(newState: Partial<RegisterState>): void {
    this._state = { ...this._state, ...newState };
    this._setState?.(this._state);
  }

  updateForm(field: keyof RegisterFormState, value: string): void {
    this.updateState({
      form: { ...this._state.form, [field]: value },
      error: null
    });
  }

  async register(): Promise<void> {
    if (this._state.isLoading) return;

    if (this._state.form.password !== this._state.form.confirmPassword) {
      this.updateState({ error: "비밀번호가 일치하지 않습니다." });
      return;
    }

    this.updateState({ isLoading: true, error: null });

    const request: RegisterRequestType = {
      name: this._state.form.name,
      email: this._state.form.email,
      password: this._state.form.password,
      teamId: this._state.form.teamId === "none" ? undefined : this._state.form.teamId,
    };

    try {
      const response = await this.registerDomain.register(request);

      if (response.success) {
        this.updateState({
          isLoading: false,
          isRegistered: true,
          error: null
        });
      } else {
        this.updateState({
          isLoading: false,
          error: response.message || "회원가입에 실패했습니다."
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

export function useRegisterViewModel(registerDomain: RegisterDomain) {
  const [viewModel] = useState(() => new RegisterViewModel(registerDomain));
  const [state, setState] = useState<RegisterState>(viewModel.state);

  if (!viewModel["_setState"]) {
    viewModel.init(setState);
  }

  return { viewModel, state };
}