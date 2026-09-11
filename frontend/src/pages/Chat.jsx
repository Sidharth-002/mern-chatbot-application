import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { toastOptions } from "../utils/toast";
import "react-toastify/dist/ReactToastify.css";
import { allUsersRoute } from "../utils/APIRoutes";
import apiClient from "../utils/apiClient";
import { AuthContext } from "../context/AuthContext";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import Logout from "../components/Logout";
import "./Chat.css";

export default function Chat() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [contactsOpen, setContactsOpen] = useState(false);
  const { state } = useContext(AuthContext);

  useEffect(() => {
    if (state?.user) {
      setCurrentUser(state.user);
    }
  }, [state?.user]);
  useEffect(() => {
    const fetchContacts = async () => {
      if (!currentUser) return;

      if (currentUser.isAvatarImageSet) {
        try {
          const { data } = await apiClient.get(
            `${allUsersRoute}/${currentUser._id}`,
          );
          setContacts(data);
        } catch (error) {
          const msg =
            error?.response?.data?.msg ||
            error?.message ||
            "Failed to fetch contacts";
          toast.error(msg, toastOptions);
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
            <div className="mobile-menu-right">
              <Logout />
            </div>
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
              onToggleContacts={toggleContacts}
            />
          )}
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
