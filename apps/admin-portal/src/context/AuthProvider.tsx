import { useEffect, useState } from 'react';

import { fetchMe } from '../services/me.api';
import { AuthContext, AuthUser } from './AuthContext';

const STORAGE_KEY = 'order-eat-user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      setUserState(raw ? JSON.parse(raw) : null);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('order-eat-access-token');
    console.log('[AuthProvider] accessToken (useEffect):', accessToken);
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('order-eat-access-token');
    if (!accessToken) {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    let retry = 0;
    const tryFetchMe = () => {
      fetchMe().then(me => {
        if (me && me.email) {
          setUserState({
            id: me.id,
            email: me.email,
            firstName: me.firstName,
            lastName: me.lastName,
            phoneNumber: me.phoneNumber,
            address: me.address,
            role: me.role,
          });
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              id: me.id,
              email: me.email,
              firstName: me.firstName,
              lastName: me.lastName,
              phoneNumber: me.phoneNumber,
              address: me.address,
              role: me.role,
            }),
          );
          setLoading(false);
        } else {
          if (retry < 2) {
            retry++;
            setTimeout(tryFetchMe, 300);
          } else {
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
            setLoading(false);
          }
        }
      }).catch((err) => {
        if (retry < 2) {
          retry++;
          setTimeout(tryFetchMe, 300);
        } else {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
        }
      });
    };
    tryFetchMe();
  }, []);

  useEffect(() => {
    console.log('[AuthProvider] user context:', user);
  }, [user]);

  if (loading) return null;

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}
