import React, { useEffect, useState } from "react";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");
  const senderId = localStorage.getItem("senderId");
  const otherId = localStorage.getItem("otherId");

  useEffect(() => {
    // Fetch chat data from the backend on initial load without a message
    fetch("http://localhost:4000/api/chat/showchats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": token,
      },
      body: JSON.stringify({
        participants: [senderId, otherId],
        messages: message
          ? [
              {
                sender_id: senderId,
                message_content: message,
              },
            ]
          : [], // Send an empty messages array on the first call
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
  }, []);

  if (!chat) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Chat with Participants:</h1>
      <input type="text" onChange={(e) => setMessage(e.target.value)} />
      <button
        onClick={() => {
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
                  message_content: message,
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
        }}
      >
        Send Message
      </button>
      <ul>
        {chat.messages.map((message) => (
          <li key={message._id}>
            <strong>{message.sender_id}</strong>: {message.message_content}{" "}
            <br />
            <small>{new Date(message.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chat;
