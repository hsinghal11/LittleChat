import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect to socket if user is authenticated
    if (isAuthenticated && user && token && user.id) {
      console.log('Connecting to socket.io server...');
      console.log('User ID for socket connection:', user.id);
      
      // Create socket connection
      const newSocket = io('http://localhost:4000', {
        auth: {
          token,
          userId: user.id // Add user ID to auth data
        }
      });

      // Set up event listeners
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.error('Socket connection error details:', error.message);
        setConnected(false);
      });

      // Save socket instance
      setSocket(newSocket);

      // Clean up on unmount
      return () => {
        console.log('Disconnecting socket...');
        newSocket.disconnect();
      };
    } else {
      console.log('Not connecting to socket - user not authenticated');
      if (!isAuthenticated) console.log('- isAuthenticated is false');
      if (!user) console.log('- user is null');
      if (!token) console.log('- token is null');
      if (user && !user.id) console.log('- user.id is missing');
    }

    return () => {
      // No cleanup needed if socket wasn't created
    };
  }, [isAuthenticated, user, token]);

  // Join a chat room
  const joinRoom = (roomId) => {
    if (socket && connected) {
      console.log(`Joining room: ${roomId}`);
      socket.emit('join_room', roomId);
    } else {
      console.warn(`Cannot join room ${roomId}: Socket not connected`);
    }
  };

  // Send a message
  const sendMessage = (data) => {
    if (socket && connected) {
      console.log(`Emitting message via socket:`, data);
      socket.emit('send_message', data);
    } else {
      console.warn('Cannot send message: Socket not connected');
    }
  };

  // Send typing status
  const sendTyping = (data) => {
    if (socket && connected) {
      console.log(`Emitting typing status:`, data);
      socket.emit('typing', data);
    } else {
      console.warn('Cannot send typing status: Socket not connected');
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    sendMessage,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 