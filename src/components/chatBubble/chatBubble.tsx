import { IMessage } from "../components";
import "./chatBubble.css";

export const ChatBubble = ({ role, content }: IMessage) => {
  return (
    <div className={`${role}-message message`}>
      <div className="message-content">{content}</div>
    </div>
  );
};
