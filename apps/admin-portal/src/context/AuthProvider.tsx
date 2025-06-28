import { useEffect, useState } from 'react';
import { AuthContext, AuthUser } from './AuthContext';

const STORAGE_KEY = 'order-eat-user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  const setUser = (u: AuthUser | null) => {
    console.log(' setUser called:', u); 
    setUserState(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      setUserState(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
