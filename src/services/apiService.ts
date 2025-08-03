// src/services/apiService.ts

import axios from 'axios';
import { User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Interceptador para adicionar o token de autenticação em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Funções de Autenticação ---
export const login = (email: string, senha: string) => api.post('/auth/login', { email, senha });

// --- Funções de Gerenciamento de Usuários (Admin) ---
export const getUsers = () => api.get<User[]>('/users');
export const createUser = (userData: any) => api.post('/users', userData);

// --- Funções do Chat ---
export const getMessages = () => api.get('/chat/general'); // Canal de chat genérico
export const postMessage = (message: string) => api.post('/chat/general', { message });

// --- Funções de Dados do Mapa (a serem implementadas no backend) ---
// export const getPlans = () => api.get('/plans');
// export const savePlans = (data: any) => api.post('/plans', data);

export default api;
