import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import Picker from "emoji-picker-react";
import "./ChatInput.css";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const emojiWrapperRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const handleEmojiPickerhideShow = () => {
    setShowEmojiPicker((prev) => {
      if (!prev) inputRef.current?.blur();
      return !prev;
    });
  };

  const handleEmojiClick = (event, emojiObject) => {
    setMsg((prev) => prev + emojiObject.emoji);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        !showEmojiPicker ||
        !emojiWrapperRef.current ||
        !emojiButtonRef.current
      ) {
        return;
      }

      if (
        !emojiWrapperRef.current.contains(event.target) &&
        !emojiButtonRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showEmojiPicker]);

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg("");
    }
  };

  return (
    <div className="chat-input-container">
      <div className="button-container">
        <button
          type="button"
          ref={emojiButtonRef}
          className="emoji-button"
          onClick={handleEmojiPickerhideShow}
          aria-label="Open emoji picker"
        >
          <BsEmojiSmileFill />
        </button>
      </div>
      {showEmojiPicker && (
        <div ref={emojiWrapperRef} className="emoji-picker-wrapper">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message"
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
          onFocus={() => setShowEmojiPicker(false)}
        />
        <button type="submit" className="send-button" aria-label="Send message">
          <IoMdSend />
        </button>
      </form>
    </div>
  );
}
