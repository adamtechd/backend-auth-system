// src/components/UserManagementModal.tsx

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser } from '../services/apiService';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para o formulário de novo usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [permissions, setPermissions] = useState({
    canEditRoutes: false,
    canExportPdf: true,
    canExportExcel: true,
    canManageUsers: false,
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await getUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Falha ao carregar usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPermissions(prev => ({ ...prev, [name]: checked }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    try {
      await createUser({ nome, email, senha, role, permissions });
      alert('Usuário criado com sucesso!');
      // Limpa o formulário e recarrega a lista de usuários
      setNome('');
      setEmail('');
      setSenha('');
      fetchUsers();
    } catch (err) {
      setError('Erro ao criar usuário. Verifique se o e-mail já existe.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Gerenciar Usuários</h2>
            <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Formulário de Novo Usuário */}
          <form onSubmit={handleCreateUser} className="mb-8 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Criar Novo Usuário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} className="p-2 border rounded" />
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="p-2 border rounded" />
              <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="p-2 border rounded" />
              <select value={role} onChange={e => setRole(e.target.value as any)} className="p-2 border rounded bg-white">
                <option value="viewer">Visualizador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Permissões Específicas:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" name="canEditRoutes" checked={permissions.canEditRoutes} onChange={handlePermissionChange} /> Editar Rotas</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="canExportPdf" checked={permissions.canExportPdf} onChange={handlePermissionChange} /> Exportar PDF</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="canExportExcel" checked={permissions.canExportExcel} onChange={handlePermissionChange} /> Exportar Excel</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="canManageUsers" checked={permissions.canManageUsers} onChange={handlePermissionChange} /> Gerenciar Usuários</label>
              </div>
            </div>
            <button type="submit" className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">Criar Usuário</button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </form>

          {/* Lista de Usuários Existentes */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Usuários Existentes</h3>
            {isLoading ? <p>Carregando...</p> : (
              <ul className="space-y-2">
                {users.map(user => (
                  <li key={user._id} className="p-2 border rounded-md flex justify-between items-center">
                    <span>{user.nome} ({user.email})</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>{user.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;