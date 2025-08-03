import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import api from '../services/apiService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
         const payload = JSON.parse(atob(token.split('.')[1]));
         setUser({ name: payload.name, role: payload.role });
      } catch(e) {
         localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
     // A requisição agora envia "email" e "senha", como o backend espera
     const response = await api.post('/auth/login', { email: email, senha: pass });
     const { token, usuario } = response.data;
     localStorage.setItem('authToken', token);
     setUser(usuario);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};