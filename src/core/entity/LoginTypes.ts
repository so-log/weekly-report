export interface LoginRequestType {
  email: string;
  password: string;
}

export interface LoginResponseType {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      team_id: string | null;
      role: string;
    };
    token: string;
  };
  message?: string;
}