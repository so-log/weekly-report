"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../component/ui/Tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../component/ui/Card";

import { LoginForm } from "../component/LoginForm";
import { RegisterForm } from "../component/RegisterForm";

import { useLoginViewModel } from "../viewmodel/LoginViewModel";
import { useRegisterViewModel } from "../viewmodel/RegisterViewModel";
import { useTeamViewModel } from "../viewmodel/TeamViewModel";

import { LoginDomain } from "../../core/domain/LoginDomain";
import { RegisterDomain } from "../../core/domain/RegisterDomain";
import { TeamDomain } from "../../core/domain/TeamDomain";

import { LoginUseCase } from "../../core/usecase/LoginUseCase";
import { RegisterUseCase } from "../../core/usecase/RegisterUseCase";
import { TeamUseCase } from "../../core/usecase/TeamUseCase";

interface AuthMainProps {
  loginApi: any;
  registerApi: any;
  teamApi: any;
}

export function AuthMain({ loginApi, registerApi, teamApi }: AuthMainProps) {
  const router = useRouter();

  const loginDomain = new LoginDomain();
  const loginUseCase = new LoginUseCase(loginDomain, loginApi);
  const { viewModel: loginViewModel, state: loginState } = useLoginViewModel(loginDomain);

  const registerDomain = new RegisterDomain();
  const registerUseCase = new RegisterUseCase(registerDomain, registerApi);
  const { viewModel: registerViewModel, state: registerState } = useRegisterViewModel(registerDomain);

  const teamDomain = new TeamDomain();
  const teamUseCase = new TeamUseCase(teamDomain, teamApi);
  const { viewModel: teamViewModel, state: teamState } = useTeamViewModel(teamDomain);

  useEffect(() => {
    if (loginState.isLoggedIn) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role === "admin" || user.role === "manager") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [loginState.isLoggedIn, router]);

  useEffect(() => {
    if (registerState.isRegistered) {
      router.push("/");
    }
  }, [registerState.isRegistered, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            주간업무보고 시스템
          </CardTitle>
          <CardDescription>
            계정에 로그인하거나 새 계정을 만드세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm viewModel={loginViewModel} state={loginState} />
            </TabsContent>

            <TabsContent value="signup">
              <RegisterForm 
                viewModel={registerViewModel} 
                state={registerState}
                teamState={teamState}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}