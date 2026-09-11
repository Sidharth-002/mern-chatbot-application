import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import "./ChatContainer.css";
import ChatInput from "../ChatInput";
import Logout from "../Logout";
import { v4 as uuidv4 } from "uuid";
import { getSocket } from "../../utils/socket";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../utils/apiClient";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";

export default function ChatContainer({ currentChat, onToggleContacts }) {
  const [messages, setMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const topSentinelRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const authContext = useContext(AuthContext);

  const fetchMessages = useCallback(
    async (pageToLoad = 0) => {
      try {
        const { state } = authContext;
        const data = state?.user;
        if (!data || !currentChat) return;

        const limit = 20;
        const { data: responseData } = await apiClient.post(
          recieveMessageRoute,
          {
            from: data._id,
            to: currentChat._id,
            page: pageToLoad,
            limit,
          },
        );

        if (pageToLoad === 0) {
          setMessages(responseData);
          setHasMore(responseData.length === limit);
          setPage(0);
        } else {
          setMessages((prev) => [...responseData, ...prev]);
          setHasMore(responseData.length === limit);
        }
      } catch (error) {
        const msg =
          error?.response?.data?.msg ||
          error?.message ||
          "Failed to fetch messages";
        console.error(msg);
      }
    },
    [currentChat, authContext],
  );

  useEffect(() => {
    if (!currentChat) return;

    setPage(0);
    setHasMore(true);
    fetchMessages(0);
  }, [currentChat, fetchMessages]);

  useEffect(() => {
    const handleReceive = (data) => {
      if (!data) return;
      if (!currentChat) return;
      const { from, to, message } = data;
      const otherId = currentChat._id;
      const { state } = authContext;
      const me = state?.user?._id;

      const isRelatedToChat = from === otherId && to === me;
      if (isRelatedToChat) {
        setMessages((prev) => {
          return [...prev, { fromSelf: false, message }];
        });
      }
    };

    const s = getSocket();
    s.on("receive-message", handleReceive);
    return () => {
      s.off("receive-message", handleReceive);
    };
  }, [authContext, currentChat]);

  const handleSendMsg = async (msg) => {
    const { state } = authContext;
    const data = state?.user;
    if (!data || !currentChat) return;

    try {
      await apiClient.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        message: msg,
      });

      const s = getSocket();
      s.emit("send-message", {
        from: data._id,
        to: currentChat._id,
        message: msg,
      });

      setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
    } catch (error) {
      const msgText =
        error?.response?.data?.msg ||
        error?.message ||
        "Failed to send message";
      console.error(msgText);
    }
  };

  useEffect(() => {
    const newLen = messages.length;
    const lastMessage = messages[newLen - 1];
    const shouldScroll =
      isAtBottomRef.current || (lastMessage && lastMessage.fromSelf);
    if (shouldScroll) {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = el;
      isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 48;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, [messagesContainerRef, currentChat]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          if (!entry.isIntersecting) return;
          if (loadingMore || !hasMore) return;
          setLoadingMore(true);
          const nextPage = page + 1;
          await fetchMessages(nextPage);
          setPage(nextPage);
          setLoadingMore(false);
        });
      },
      { root: messagesContainerRef.current, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [topSentinelRef, fetchMessages, page, loadingMore, hasMore]);

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
      <div className="chat-messages" ref={messagesContainerRef}>
        <div ref={topSentinelRef} style={{ height: 1 }} />
        {messages.map((message) => {
          return (
            <div key={uuidv4()}>
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
