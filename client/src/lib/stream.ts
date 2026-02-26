import { StreamChat } from "stream-chat";

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

if (!apiKey) {
  console.warn("VITE_STREAM_API_KEY is missing. Chat features will not work.");
}

export const chatClient = StreamChat.getInstance(apiKey || "placeholder");
