// src/components/ChatPanel.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getMessages, postMessage } from '../services/apiService';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  _id: string;
  userName: string;
  message: string;
  timestamp: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error("Falha ao buscar mensagens do chat", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages(); // Carga inicial
      const interval = setInterval(fetchMessages, 5000); // Atualiza a cada 5 segundos
      return () => clearInterval(interval); // Limpa o intervalo ao fechar
    }
  }, [isOpen]);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await postMessage(newMessage);
      setNewMessage('');
      fetchMessages(); // Recarrega as mensagens imediatamente após enviar
    } catch (error) {
      console.error("Falha ao enviar mensagem", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-lg z-40 p-4 flex flex-col">
       <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Chat Geral</h3>
        <button onClick={onClose} className="font-bold text-2xl leading-none">&times;</button>
       </div>
       <div ref={chatBoxRef} className="flex-grow border rounded p-2 overflow-y-auto mb-2 bg-slate-50 space-y-2">
         {messages.map(msg => (
           <div key={msg._id} className="text-sm">
            <span className="font-bold text-indigo-700">{msg.userName}:</span>
            <span className="ml-2 text-slate-800">{msg.message}</span>
           </div>
         ))}
       </div>
       <form onSubmit={handleSendMessage} className="flex">
         <input 
           type="text" 
           value={newMessage} 
           onChange={e => setNewMessage(e.target.value)} 
           className="flex-grow border rounded-l px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
           placeholder="Digite sua mensagem..."
         />
         <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r hover:bg-indigo-700">Enviar</button>
       </form>
    </div>
  );
};

export default ChatPanel;