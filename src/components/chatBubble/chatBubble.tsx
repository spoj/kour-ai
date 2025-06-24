import { IMessage } from "../components";
import "./chatBubble.css";

export const ChatBubble = ({ role, content, isNotification }: IMessage) => {
  return (
    <div
      className={`chat-bubble ${role}-message ${isNotification ? "notification" : ""}`}
    >
      <p>{content}</p>
    </div>
  );
};
