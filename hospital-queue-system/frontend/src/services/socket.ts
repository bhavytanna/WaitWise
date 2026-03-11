import { io, type Socket } from 'socket.io-client';

const rawBase = (import.meta as any).env?.VITE_API_URL;
const API_BASE = typeof rawBase === 'string' && rawBase.trim() ? rawBase.trim() : 'http://127.0.0.1:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}
