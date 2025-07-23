"use client";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { LoginViewModel, LoginState } from "../viewmodel/LoginViewModel";

interface LoginFormProps {
  viewModel: LoginViewModel;
  state: LoginState;
}

export function LoginForm({ viewModel, state }: LoginFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await viewModel.login();
  };

  return (
    <Card className="w-full max-w-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={state.email}
            onChange={(e) => viewModel.updateEmail(e.target.value)}
            disabled={state.isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={state.password}
            onChange={(e) => viewModel.updatePassword(e.target.value)}
            disabled={state.isLoading}
          />
        </div>

        {state.error && (
          <div className="text-red-500 text-sm">{state.error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={state.isLoading}
        >
          {state.isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </Card>
  );
}