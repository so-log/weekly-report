"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../component/LoginForm";
import { useLoginViewModel } from "../viewmodel/LoginViewModel";
import { LoginDomain } from "../../core/domain/LoginDomain";
import { LoginUseCase } from "../../core/usecase/LoginUseCase";

interface LoginMainProps {
  loginApi: any; // LoginApi 구현체
}

export function LoginMain({ loginApi }: LoginMainProps) {
  const router = useRouter();
  
  const loginUseCase = new LoginUseCase(loginApi);
  const loginDomain = new LoginDomain(loginUseCase);
  const { viewModel, state } = useLoginViewModel(loginDomain);

  useEffect(() => {
    if (state.isLoggedIn) {
      router.push("/");
    }
  }, [state.isLoggedIn, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
          <p className="text-gray-600 mt-2">계정에 로그인하세요</p>
        </div>
        
        <LoginForm viewModel={viewModel} state={state} />
      </div>
    </div>
  );
}