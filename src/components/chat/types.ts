export type MessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};
