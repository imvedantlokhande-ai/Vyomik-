import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  token: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          setUser(firebaseUser);
          const t = await firebaseUser.getIdToken();
          setToken(t);
        } else {
          const mockUser = localStorage.getItem('vyomik_mock_user');
          if (mockUser) {
            setUser(JSON.parse(mockUser));
            setToken("mock_token_123");
          } else {
            setUser(null);
            setToken(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Mock auth flow
      const mockUser = localStorage.getItem('vyomik_mock_user');
      if (mockUser) {
        setUser(JSON.parse(mockUser));
        setToken("mock_token_123");
      }
      setLoading(false);
    }
  }, []);

  const handleSetUser = (newUser: any | null) => {
    setUser(newUser);
    if (!isFirebaseConfigured || (newUser && newUser.uid === 'mock-guest-uid')) {
      if (newUser) {
        localStorage.setItem('vyomik_mock_user', JSON.stringify(newUser));
        setToken("mock_token_123");
      } else {
        localStorage.removeItem('vyomik_mock_user');
        setToken(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
