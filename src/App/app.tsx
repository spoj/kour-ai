import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { SettingsModal, IMessage, ChatBubble } from "../components";
import "./app.css";
import { chatCompletion } from "../helpers";

export const App = () => {
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<IMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newChatHistory = [
        ...chatHistory,
        { role: "user", content: message } as IMessage,
      ];
      setChatHistory(newChatHistory);
      setMessage("");

      chatCompletion({ newChatHistory, setChatHistory, setIsTyping });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  return (
    <div className="container">
      <header>
        <h1>Kour-AI</h1>
        <div id="path-container">
          <input
            type="text"
            id="path-input"
            placeholder="Enter root directory..."
          />
        </div>
        <div style={{ paddingLeft: "10px" }}>
          <button id="header-button" title="Restart Session">
            Restart
          </button>
          <button
            id="header-button"
            title="Settings"
            onClick={() => setOpenSettingsModal(!openSettingsModal)}
          >
            Settings
          </button>
        </div>
      </header>
      <div id="chat-container" ref={chatContainerRef}>
        {chatHistory.map((chat, index) => (
          <ChatBubble
            key={index}
            role={chat.role}
            content={chat.content}
            isNotification={chat.isNotification}
          />
        ))}
        {isTyping && (
          <ChatBubble role="assistant" content="Thinking..." isNotification />
        )}
      </div>
      <div id="input-container">
        <textarea
          id="message-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>
        <button id="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
      {openSettingsModal && <SettingsModal onClose={setOpenSettingsModal} />}
    </div>
  );
};

const root = createRoot(document.body);
root.render(<App />);
