import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import { toastOptions } from "../utils/toast";
import "react-toastify/dist/ReactToastify.css";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [contactsOpen, setContactsOpen] = useState(false);
  useEffect(() => {
    const storedUser = localStorage.getItem(
      process.env.REACT_APP_LOCALHOST_KEY,
    );

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      setCurrentUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("Failed to parse stored user", error);
      toast.error("Something went wrong. Redirected to login", toastOptions);
      localStorage.removeItem(process.env.REACT_APP_LOCALHOST_KEY);
      navigate("/login");
    }
  }, [navigate]);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;

      if (currentUser.isAvatarImageSet) {
        try {
          const { data } = await axios.get(
            `${allUsersRoute}/${currentUser._id}`,
          );
          setContacts(data);
        } catch (error) {
          console.error("Failed to fetch contacts", error);
        }
      } else {
        navigate("/setAvatar");
      }
    };

    fetchContacts();
  }, [currentUser, navigate]);
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setContactsOpen(false);
  };

  const toggleContacts = () => {
    setContactsOpen((prev) => !prev);
  };

  return (
    <>
      <div className="chat-page">
        {currentChat === undefined && (
          <div className="mobile-menu-bar">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={toggleContacts}
            >
              ☰
            </button>
            {/* <span>Chats</span> */}
          </div>
        )}
        <div className="chat-container">
          <Contacts
            contacts={contacts}
            changeChat={handleChatChange}
            isMobileOpen={contactsOpen}
            closeMobileMenu={() => setContactsOpen(false)}
          />
          {contactsOpen && (
            <div
              className="contacts-backdrop"
              onClick={() => setContactsOpen(false)}
            />
          )}
          {currentChat === undefined ? (
            <Welcome />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              socket={socket}
              onToggleContacts={toggleContacts}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
