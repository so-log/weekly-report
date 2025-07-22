"use client";

import { AuthMain } from "../view/AuthMain";
import { LoginApiImpl } from "../../core/repository/LoginApiImpl";
import { RegisterApiImpl } from "../../core/repository/RegisterApiImpl";
import { TeamApiImpl } from "../../core/repository/TeamApiImpl";

export default function AuthPage() {
  const loginApi = new LoginApiImpl();
  const registerApi = new RegisterApiImpl();
  const teamApi = new TeamApiImpl();

  return <AuthMain loginApi={loginApi} registerApi={registerApi} teamApi={teamApi} />;
}