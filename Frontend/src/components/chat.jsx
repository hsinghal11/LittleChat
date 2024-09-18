import React, { useEffect, useState } from "react";

const Chat = ({senderId}) => { // taking sender id props from user when he will login
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState(""); 
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch chat data from the backend
    fetch("/api/showchats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        participants: ["66e16a3f19517ff8e74927ff", "66e5aa6417a0ead81d7191f4"],
        messages: [
          {
            sender_id: "66e16a3f19517ff8e74927ff",
            message_content: message,
          },
        ],
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
  }, [message]);

  if (!chat) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Chat with Participants:</h1>
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
