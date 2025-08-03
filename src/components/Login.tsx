
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (error) {
      alert('Login inválido');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder='Senha' type='password' value={senha} onChange={e => setSenha(e.target.value)} />
      <button type='submit'>Entrar</button>
    </form>
  );
};

export default Login;
