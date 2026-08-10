import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ChatContainer.css";
import ChatInput from "../ChatInput";
import Logout from "../Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";

export default function ChatContainer({ currentChat, onToggleContacts }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  const fetchMessages = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem(
        process.env.REACT_APP_LOCALHOST_KEY,
      );
      if (!storedUser || !currentChat) return;
      const data = JSON.parse(storedUser);
      const response = await axios.post(recieveMessageRoute, {
        from: data._id,
        to: currentChat._id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [currentChat]);

  useEffect(() => {
    if (!currentChat) return;

    fetchMessages();

    const intervalId = setInterval(() => {
      fetchMessages();
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentChat, fetchMessages]);

  const handleSendMsg = async (msg) => {
    const data = JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY),
    );
    if (!data || !currentChat) return;
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container-inner">
      <div className="chat-header">
        <button
          type="button"
          className="menu-button"
          onClick={onToggleContacts}
        >
          ☰
        </button>
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
}
