import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { socket, connected, joinRoom } = useSocket();
  
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  // Fetch user's chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!token || !user || !user.id) {
        console.log('Not fetching chats: User not authenticated or missing ID');
        return;
      }
      
      setLoading(true);
      try {
        console.log(`Fetching chats for user ID: ${user.id}`);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/user-chats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token,
            'user-id': user.id
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Chats fetched successfully:', data.chats);
          setChats(data.chats);
        } else {
          const errorData = await response.json();
          console.error('Error fetching chats:', errorData);
          setError(errorData.message || 'Failed to fetch chats');
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
        setError('Failed to fetch chats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, [token, user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveMessage = (data) => {
      if (activeChat && activeChat._id === data.chatId) {
        setMessages(prev => [...prev, data.message]);
      }
      
      // Update the chat list to show the new message
      setChats(prev => 
        prev.map(chat => 
          chat._id === data.chatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, data.message],
                lastMessage: new Date()
              } 
            : chat
        )
      );
    };
    
    const handleUserTyping = (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => ({
          ...prev,
          [data.userId]: {
            isTyping: data.isTyping,
            timestamp: new Date()
          }
        }));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [data.userId]: {
              isTyping: false,
              timestamp: new Date()
            }
          }));
        }, 3000);
      }
    };
    
    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeChat, user]);

  // Join room when active chat changes
  useEffect(() => {
    if (activeChat && connected) {
      joinRoom(activeChat._id);
    }
  }, [activeChat, connected, joinRoom]);

  // Set active chat and load messages
  const selectChat = async (chatId) => {
    const chat = chats.find(c => c._id === chatId);
    if (chat) {
      setActiveChat(chat);
      setMessages(chat.messages || []);
    }
  };

  // Create or get a chat with a user
  const startChat = async (participantId) => {
    if (!token || !user || !user.id) {
      console.error('Cannot start chat: User not authenticated or missing ID');
      setError('You must be logged in to start a chat');
      return null;
    }
    
    if (!participantId) {
      console.error('Cannot start chat: Missing participant ID');
      setError('Invalid participant');
      return null;
    }
    
    try {
      console.log(`Starting chat with participant ID: ${participantId}`);
      console.log(`Current user ID: ${user.id}`);
      
      // Validate participant IDs
      const participants = [user.id, participantId].filter(id => id && id !== 'undefined' && id !== 'null');
      
      if (participants.length !== 2) {
        console.error('Invalid participants array:', participants);
        setError('Invalid participant IDs');
        return null;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
          'user-id': user.id
        },
        body: JSON.stringify({
          participants
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Chat created/found:', data);
        
        // Check if chat already exists in the list
        const existingChatIndex = chats.findIndex(c => c._id === data.chat._id);
        
        if (existingChatIndex >= 0) {
          // Update existing chat
          const updatedChats = [...chats];
          updatedChats[existingChatIndex] = data.chat;
          setChats(updatedChats);
        } else {
          // Add new chat to list
          setChats(prev => [...prev, data.chat]);
        }
        
        // Set as active chat
        setActiveChat(data.chat);
        setMessages(data.chat.messages || []);
        
        return data.chat;
      } else {
        console.error('Error creating/finding chat:', data);
        setError(data.message || 'Failed to create chat');
        return null;
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat');
      return null;
    }
  };

  // Send a message
  const sendMessage = async (content) => {
    if (!activeChat || !token || !user) return null;
    
    const message = {
      sender_id: user.id,
      message_content: content,
      timestamp: new Date()
    };
    
    try {
      console.log(`Sending message to chat ${activeChat._id}:`, message);
      
      // Optimistically update UI
      setMessages(prev => [...prev, message]);
      
      // Send via socket
      if (socket && connected) {
        socket.emit('send_message', {
          room: activeChat._id,
          chatId: activeChat._id,
          message,
          senderId: user.id
        });
      }
      
      // Also save to database
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat/add-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
          'user-id': user.id
        },
        body: JSON.stringify({
          chatId: activeChat._id,
          message
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error saving message:', data);
        setError(data.message);
      } else {
        console.log('Message saved successfully:', data);
      }
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      return null;
    }
  };

  // Send typing status
  const sendTypingStatus = (isTyping) => {
    if (!activeChat || !socket || !connected || !user) return;
    
    socket.emit('typing', {
      room: activeChat._id,
      userId: user.id,
      isTyping
    });
  };

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    error,
    typingUsers,
    selectChat,
    startChat,
    sendMessage,
    sendTypingStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext; 