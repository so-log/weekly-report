export interface Team {
  id: string;
  name: string;
}

export interface TeamsResponseType {
  success: boolean;
  data?: Team[];
  message?: string;
}