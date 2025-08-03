
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Bem-vindo, {user?.nome}</h1>
      <p>Você é: {user?.role}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};

export default Dashboard;
