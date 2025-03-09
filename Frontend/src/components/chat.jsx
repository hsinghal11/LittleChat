import React, { useEffect, useState } from "react";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const senderId = localStorage.getItem("senderId");
  const otherId = localStorage.getItem("otherId");

  const fetchChatData = () => {
    fetch("http://localhost:4000/api/chat/showchats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        participants: [senderId, otherId],
        messages: [],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.chat) {
          // Sort messages by timestamp
          const sortedMessages = data.chat.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setChat({ ...data.chat, messages: sortedMessages });
        }
      })
      .catch((error) => console.error("Error fetching chat:", error));
  };

  useEffect(() => {
    // Fetch chat data from the backend on initial load
    fetchChatData();
  }, []);

  const handleSendMessage = () => {
    if (!message.trim()) return; // Don't send empty messages
    
    // Create a temporary message object for immediate display
    const tempMessage = {
      _id: Date.now().toString(), // Temporary ID
      sender_id: senderId,
      message_content: message,
      timestamp: new Date().toISOString()
    };
    
    // Update the UI immediately with the new message
    setChat(prevChat => {
      const updatedMessages = [...prevChat.messages, tempMessage].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
      return { ...prevChat, messages: updatedMessages };
    });
    
    // Clear the input field
    setMessage("");
    
    // Send message to the server
    fetch("http://localhost:4000/api/chat/showchats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        participants: [senderId, otherId],
        messages: [
          {
            sender_id: senderId,
            message_content: tempMessage.message_content,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.chat) {
          const sortedMessages = data.chat.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setChat({ ...data.chat, messages: sortedMessages });
        }
      })
      .catch((error) => console.error("Error sending message:", error));
  };

  if (!chat) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-bold mb-4">Chat with Participants:</h1>
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {chat.messages.map((message) => {
          const isCurrentUser = message.sender_id === senderId;
          return (
            <div 
              key={message._id} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                style={{ 
                  maxWidth: '80%',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: isCurrentUser ? '#1982FC' : '#E5E5EA',
                  color: isCurrentUser ? 'white' : 'black',
                  marginBottom: '8px',
                  borderBottomRightRadius: isCurrentUser ? '4px' : '12px',
                  borderBottomLeftRadius: isCurrentUser ? '12px' : '4px',
                }}
              >
                <p>{message.message_content}</p>
                <p style={{ 
                  fontSize: '10px', 
                  marginTop: '4px',
                  color: isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex mt-2">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-full hover:bg-blue-600 focus:outline-none"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
