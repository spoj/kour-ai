import { IMessage } from "../components";

interface IChatCompletion {
  newChatHistory: IMessage[];
  setIsTyping: (val: boolean) => void;
  setChatHistory: Function;
}

export const chatCompletion = ({
  newChatHistory,
  setIsTyping,
  setChatHistory,
}: IChatCompletion) => {
  const settings = window.electron.getSettings();

  window.electron.chatCompletion(
    {
      apiKey: settings.apiKey,
      modelName: settings.modelName,
      rootDir: settings.rootDir,
      messages: newChatHistory.map((m: IMessage) => ({
        role: m.role,
        content: m.content,
      })),
    },
    (update) => {
      if (update.type === "start") {
        setIsTyping(true);
      } else if (update.type === "end") {
        setIsTyping(false);
      } else if (update.type === "update") {
        const botMessage: IMessage = {
          role: "assistant",
          content: update.message,
          isNotification: update.isNotification,
        };
        setChatHistory((prev: IMessage[]) => [...prev, botMessage]);
      }
    }
  );
};
