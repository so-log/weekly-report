"use client";

import { LoginMain } from "../view/LoginMain";
import { LoginApiImpl } from "../../infrastructure/LoginApiImpl";

export default function LoginPage() {
  const loginApi = new LoginApiImpl();

  return <LoginMain loginApi={loginApi} />;
}