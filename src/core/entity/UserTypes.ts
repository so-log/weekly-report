export interface UserDetail {
  id: string;
  name: string;
  email: string;
  team_id: string | null;
  team_name?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserRequestType {
  id: string;
  name?: string;
  email?: string;
  team_id?: string | null;
}

export interface DeleteUserRequestType {
  id: string;
}

export interface UsersResponseType {
  success: boolean;
  data?: UserDetail[];
  message?: string;
}

export interface UpdateUserResponseType {
  success: boolean;
  data?: UserDetail;
  message?: string;
}

export interface DeleteUserResponseType {
  success: boolean;
  message?: string;
}