import { useEffect, useState } from "react";
import {
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import { Button } from "@/components/ui/button";

export const AgentHandler = () => {
  const { channel } = useChannelStateContext();
  const { client } = useChatContext();
  const [agentActive, setAgentActive] = useState(false);

  useEffect(() => {
    if (!channel || !client.user) return;

    const handleNewMessage = async (event: any) => {
      // Only respond to messages from current user
      if (event.message?.user?.id === client.user?.id) {
        // Check if agent is member? OR just always respond if active?
        // Requirement: "Spawn agent... Listen to new messages"

        // We will use a flag or check if 'ai-agent' is in members
        const members = Object.keys(channel.state.members);
        if (members.includes("ai-agent")) {
          console.log("Agent active, sending for processing...");
          try {
            await fetch(
              `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/agent/message`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  channelType: channel.type,
                  channelId: channel.id,
                  text: event.message.text,
                }),
              },
            );
          } catch (e) {
            console.error("Error triggering agent", e);
          }
        }
      }
    };

    client.on("message.new", handleNewMessage);

    return () => {
      client.off("message.new", handleNewMessage);
    };
  }, [channel, client, agentActive]);

  const toggleAgent = async () => {
    if (!channel) return;
    try {
      if (agentActive) {
        // Logic to remove agent? or just ignore.
        // Currently API only supports start.
        // We'll just start it.
      } else {
        await fetch(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/agent/start`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channelType: channel.type,
              channelId: channel.id,
            }),
          },
        );
        setAgentActive(true);
        // Force reload members?
        await channel.query({ watch: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Check if agent is already in members on load
  useEffect(() => {
    if (channel && channel.state.members["ai-agent"]) {
      setAgentActive(true);
    }
  }, [channel?.state.members]);

  return (
    <div className="absolute top-2 right-12 z-10">
      <Button
        size="sm"
        variant={agentActive ? "secondary" : "default"}
        onClick={toggleAgent}
      >
        {agentActive ? "Agent Active" : "Start Agent"}
      </Button>
    </div>
  );
};
