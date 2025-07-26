import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Socket => {
  console.log('Socket lib: Initializing socket for user:', userId);
  
  if (socket?.connected) {
    console.log('Socket lib: Reusing existing connected socket');
    return socket;
  }

  // Disconnect existing socket if any
  if (socket) {
    console.log('Socket lib: Disconnecting existing socket');
    socket.disconnect();
  }

  const serverUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000';
  console.log('Socket lib: Connecting to:', serverUrl);

  // Initialize socket connection
  socket = io(serverUrl, {
    query: {
      userId,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'], // Allow fallback to polling
  });

  socket.on('connect', () => {
    console.log('Socket lib: Connected to server with ID:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket lib: Disconnected from server. Reason:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket lib: Connection error:', error);
  });

  socket.on('error', (error) => {
    console.error('Socket lib: Socket error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket lib: Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Socket lib: Reconnection attempt', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket lib: Reconnection error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Socket lib: Manually disconnecting socket');
    socket.disconnect();
    socket = null;
  }
}; 