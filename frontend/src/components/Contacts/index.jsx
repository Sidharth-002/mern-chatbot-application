import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Logo from "../../assets/logo.png";
import Logout from "../Logout";
import "./Contacts.css";
import { IoCloseOutline } from "react-icons/io5";

export default function Contacts({
  contacts,
  changeChat,
  isMobileOpen,
  closeMobileMenu,
}) {
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const { state } = useContext(AuthContext);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      <div className={`container-div ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-left">
            <img src={Logo} alt="logo" />
            <div className="brand-text">
              <h3>KC Bot</h3>
              <p>Stay connected with your contacts</p>
            </div>
          </div>
          <button
            type="button"
            className="mobile-close"
            onClick={closeMobileMenu}
            aria-label="Close contacts menu"
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* <div className="contacts-header">
            <div>
              <h4>Chats</h4>
              <p>All active conversations</p>
            </div>
            <span>{contacts.length}</span>
          </div> */}

        <div className="contacts">
          {contacts.map((contact, index) => {
            return (
              <div
                key={contact._id}
                className={`contact ${
                  index === currentSelected ? "selected" : ""
                }`}
                onClick={() => changeCurrentChat(index, contact)}
                role="button"
                tabIndex={0}
              >
                <div className="avatar">
                  <img
                    src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                    alt={contact.username}
                  />
                </div>
                <div className="username">
                  <h3>{contact.username}</h3>
                </div>
              </div>
            );
          })}
        </div>
        <div className="current-user">
          <div className="current-user-info">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${state.user.avatarImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{state.user.username}</h2>
              <p>Online now</p>
            </div>
          </div>
          <div className="current-user-action">
            <Logout />
          </div>
        </div>
      </div>
    </>
  );
}
