import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let socket: Socket | null = null;

export const connectSocket = () => {
  if (socket?.connected) return;
  const token = localStorage.getItem('user_token');
  
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: false
  });
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const getSocket = () => socket;