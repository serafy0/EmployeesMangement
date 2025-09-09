import { User } from './user.model';

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expirationTime?: Date;
  user?: User;
}
