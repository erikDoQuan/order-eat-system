import { useEffect, useState } from 'react';

import { fetchMe } from '../services/me.api';
import { AuthContext, AuthUser } from './AuthContext';

const STORAGE_KEY = 'order-eat-user';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsedUser = raw ? JSON.parse(raw) : null;
    // Nếu user từ localStorage không có address, return null để force fetch từ API
    if (parsedUser && !parsedUser.address) {
      return null;
    }
    return parsedUser;
  });
  const [loading, setLoading] = useState(true);

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      if (u.role !== 'admin') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
        if (u.id) {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('order-eat-cart-') && !key.endsWith(String(u.id))) {
              localStorage.removeItem(key);
            }
          });
        }
        localStorage.removeItem('order-eat-cart-guest');
      } else {
        // Nếu là admin, không lưu vào localStorage
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  useEffect(() => {
    const sync = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsedUser = raw ? JSON.parse(raw) : null;
      setUserState(parsedUser);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('order-eat-access-token');
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('order-eat-access-token');
    if (!accessToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Nếu user hiện tại không có address, force fetch từ API
    if (user && !user.address) {
    }

    let retry = 0;
    const tryFetchMe = () => {
      fetchMe()
        .then(me => {
          if (me && me.email) {
            const userData = {
              id: me.id,
              email: me.email,
              firstName: me.firstName,
              lastName: me.lastName,
              phoneNumber: me.phoneNumber,
              address: me.address || '', // Đảm bảo address không undefined
              role: me.role,
            };
            setUserState(userData);
            if (me.role !== 'admin') {
              const localStorageData = {
                id: me.id,
                email: me.email,
                firstName: me.firstName,
                lastName: me.lastName,
                phoneNumber: me.phoneNumber,
                address: me.address || '', // Đảm bảo address không undefined
                role: me.role,
              };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(localStorageData));
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
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
        })
        .catch(err => {
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

  useEffect(() => {}, [user]);

  if (loading) return null;

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
}
