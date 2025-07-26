"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuth } from './auth-context';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Socket context: User state changed:', user?.id ? 'User available' : 'No user');
    
    // Always try to connect, use a fallback ID if no user
    const userId = user?.id || `anonymous-${Date.now()}`;
    console.log('Socket context: Attempting to connect with ID:', userId);
    
    // Initialize socket connection
    const socketInstance = initializeSocket(userId);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket context: Connected successfully');
      setIsConnected(true);
      socketInstance.emit('user-online', userId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket context: Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket context: Connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('users-online', (users: string[]) => {
      console.log('Socket context: Users online:', users);
      setOnlineUsers(users);
    });

    socketInstance.on('user-joined', (userId: string) => {
      setOnlineUsers(prev => [...prev, userId]);
    });

    socketInstance.on('user-left', (userId: string) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    return () => {
      console.log('Socket context: Cleaning up connection');
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('users-online');
      socketInstance.off('user-joined');
      socketInstance.off('user-left');
    };
  }, [user?.id]);

  const joinRoom = (roomId: string) => {
    console.log('Socket context: Joining room:', roomId);
    if (socket) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    console.log('Socket context: Leaving room:', roomId);
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  const sendMessage = (roomId: string, message: any) => {
    console.log('Socket context: Sending message to room:', roomId);
    if (socket) {
      socket.emit('room-message', { roomId, message });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        joinRoom,
        leaveRoom,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 