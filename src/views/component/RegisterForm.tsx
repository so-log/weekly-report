"use client";

import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/Select";
import { RegisterViewModel, RegisterState } from "../viewmodel/RegisterViewModel";
import { TeamState } from "../viewmodel/TeamViewModel";

interface RegisterFormProps {
  viewModel: RegisterViewModel;
  state: RegisterState;
  teamState: TeamState;
}

export function RegisterForm({ viewModel, state, teamState }: RegisterFormProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await viewModel.register();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {state.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          이름
        </label>
        <Input
          id="name"
          type="text"
          placeholder="이름을 입력하세요"
          value={state.form.name}
          onChange={(e) => viewModel.updateForm("name", e.target.value)}
          disabled={state.isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder="이메일을 입력하세요"
          value={state.form.email}
          onChange={(e) => viewModel.updateForm("email", e.target.value)}
          disabled={state.isLoading}
          required
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
          value={state.form.password}
          onChange={(e) => viewModel.updateForm("password", e.target.value)}
          disabled={state.isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          비밀번호 확인
        </label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={state.form.confirmPassword}
          onChange={(e) => viewModel.updateForm("confirmPassword", e.target.value)}
          disabled={state.isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="team" className="text-sm font-medium">
          팀 선택
        </label>
        <Select
          value={state.form.teamId}
          onValueChange={(value) => viewModel.updateForm("teamId", value)}
          disabled={state.isLoading || teamState.isLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                teamState.isLoading
                  ? "팀 목록 로딩 중..."
                  : "팀을 선택하세요"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">팀 없음</SelectItem>
            {teamState.teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={state.isLoading}
      >
        {state.isLoading ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}