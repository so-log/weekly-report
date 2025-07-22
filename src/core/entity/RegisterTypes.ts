export interface RegisterRequestType {
  email: string;
  password: string;
  name: string;
  teamId?: string;
}

export interface RegisterResponseType {
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