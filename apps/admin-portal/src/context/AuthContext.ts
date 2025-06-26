import { createContext } from 'react';

export interface AuthUser {
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});
