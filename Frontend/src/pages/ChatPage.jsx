import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { 
    chats, 
    activeChat, 
    messages, 
    typingUsers, 
    selectChat, 
    sendMessage, 
    sendTypingStatus 
  } = useChat();
  const { connected } = useSocket();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Select chat when chatId changes
  useEffect(() => {
    if (chatId) {
      selectChat(chatId);
    }
  }, [chatId, selectChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing status
  useEffect(() => {
    let typingTimer;
    if (isTyping) {
      sendTypingStatus(true);
      
      // Clear typing status after 3 seconds of inactivity
      typingTimer = setTimeout(() => {
        setIsTyping(false);
        sendTypingStatus(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(typingTimer);
    };
  }, [isTyping, sendTypingStatus]);

  // Handle message input change
  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false);
      sendTypingStatus(false);
    }
  };

  // Handle message send
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    console.log(`Sending message: ${messageInput}`);
    console.log(`Active chat: ${activeChat?._id}`);
    
    sendMessage(messageInput)
      .then(result => {
        console.log('Message sent result:', result);
        setMessageInput('');
        setIsTyping(false);
        sendTypingStatus(false);
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  };

  // Find the other participant (not the current user)
  const otherParticipant = activeChat?.participants?.find(p => p._id !== user?.id);

  // Check if the other user is typing
  const isOtherUserTyping = otherParticipant && typingUsers[otherParticipant._id]?.isTyping;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
              &larr; Back
            </Link>
            {activeChat ? (
              <div className="flex items-center">
                <img 
                  src={otherParticipant?.avatar || `https://ui-avatars.com/api/?name=${otherParticipant?.name?.charAt(0)}&background=random`} 
                  alt={otherParticipant?.name} 
                  className="h-8 w-8 rounded-full mr-3"
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{otherParticipant?.name}</h1>
                  <p className="text-xs text-gray-500">
                    {connected ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="text-lg font-semibold text-gray-900">Loading chat...</h1>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id;
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p>{message.message_content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing indicator */}
                {isOtherUserTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || !activeChat}
                className={`px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  !messageInput.trim() || !activeChat ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Send
              </button>
            </form>
            {!activeChat && (
              <p className="text-red-500 text-sm mt-2">Cannot send messages: No active chat selected</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage; 