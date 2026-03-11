import type { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function attachIo(server: SocketIOServer) {
  io = server;

  server.on('connection', (socket) => {
    socket.on('queue:joinDoctorRoom', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`);
    });
  });
}

export function getIo(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
