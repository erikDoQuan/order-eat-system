import { createContext } from 'react';

export interface AuthUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  phone_number?: string;
  address?: string; // Chỉ dùng address (thường), không cần Address (hoa)
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
