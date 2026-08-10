import React, { useState, useEffect, useRef } from "react";
import "./ChatContainer.css";
import ChatInput from "../ChatInput";
import Logout from "../Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";

export default function ChatContainer({
  currentChat,
  socket,
  onToggleContacts,
}) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const currentChatRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const storedUser = localStorage.getItem(
          process.env.REACT_APP_LOCALHOST_KEY,
        );
        if (!storedUser) return;
        const data = JSON.parse(storedUser);
        const response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY),
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY),
    );
    if (!data || !currentChat) return;
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages, { fromSelf: true, message: msg }];
    setMessages(msgs);
  };

  useEffect(() => {
    if (!socket || !socket.current) return;
    const handleMsgReceive = (payload) => {
      // payload may be a string (older server) or an object { from, msg }
      const from = payload && typeof payload === "object" ? payload.from : null;
      const messageText =
        payload && typeof payload === "object" && payload.msg !== undefined
          ? payload.msg
          : payload;
      const incoming = { fromSelf: false, message: messageText, from };
      // store arrivalMessage for other flows (unread, notifications)
      setArrivalMessage(incoming);

      // if the currently open chat is the sender, append immediately
      const openChat = currentChatRef.current;
      if (openChat && String(openChat._id) === String(from)) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.message === incoming.message &&
              m.fromSelf === incoming.fromSelf,
          );
          return exists ? prev : [...prev, incoming];
        });
      }
    };

    const sock = socket.current;
    sock.on("msg-recieve", handleMsgReceive);
    return () => {
      sock.off && sock.off("msg-recieve", handleMsgReceive);
      sock.removeListener &&
        sock.removeListener("msg-recieve", handleMsgReceive);
    };
  }, [socket]);

  useEffect(() => {
    if (!arrivalMessage) return;
    if (!currentChat || String(currentChat._id) !== String(arrivalMessage.from))
      return;
    setMessages((prev) => {
      const exists = prev.some(
        (m) =>
          m.message === arrivalMessage.message &&
          m.fromSelf === arrivalMessage.fromSelf,
      );
      return exists ? prev : [...prev, arrivalMessage];
    });
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // keep a ref of currentChat so socket handler has latest value
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

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
