import { ThemeProvider } from "./components/ThemeProvider";
import { WorkspaceLayout } from "./components/layout/WorkspaceLayout";
import { Sidebar } from "./components/layout/Sidebar";
import ChatInterface from "./components/ChatInterface";
import AIAssistantPanel from "./components/AIAssistantPanel";
import LandingPage from "./components/LandingPage";
import { useState, useCallback, useEffect } from "react";
import type { IChatMetadata } from "./types/chat";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";

const apiKey = import.meta.env.VITE_STREAM_API_KEY || "your_api_key";

function App() {
  const [client, setClient] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [lastMetadata, setLastMetadata] = useState<IChatMetadata | null>(null);
  const [aiStateKey, setAiStateKey] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("promptly_token");
      const userId = localStorage.getItem("promptly_userId");

      if (token && userId) {
        try {
          setIsConnecting(true);
          const chatClient = StreamChat.getInstance(apiKey);

          // Fetch user profile from backend
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/${userId}`);
          const user = await res.json();

          if (res.ok) {
            await chatClient.connectUser(
              { id: userId, name: user.name },
              token,
            );
            setClient(chatClient);
            setUserProfile(user);
          }
        } catch (error) {
          console.error("Restoring session failed:", error);
          localStorage.clear();
        } finally {
          setIsConnecting(false);
        }
      }
    };
    restoreSession();
  }, []);

  const handleLogin = useCallback(
    async (
      userId: string,
      userName: string,
      password: string,
      isRegistering: boolean,
    ) => {
      setIsConnecting(true);
      try {
        const chatClient = StreamChat.getInstance(apiKey);
        const endpoint = isRegistering ? "/api/register" : "/api/login";
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, userName, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Authentication failed");
        }

        const { token, jwt: jwtToken, user } = data;
        await chatClient.connectUser({ id: userId, name: userName }, token);

        localStorage.setItem("promptly_token", token);
        localStorage.setItem("promptly_jwt", jwtToken);
        localStorage.setItem("promptly_userId", userId);

        setClient(chatClient);
        setUserProfile(user);
      } catch (error: any) {
        console.error("Authentication failed:", error);
        alert(error.message || "Failed to authenticate. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    if (client) {
      await client.disconnectUser();
      localStorage.removeItem("promptly_token");
      localStorage.removeItem("promptly_jwt");
      localStorage.removeItem("promptly_userId");
      setClient(null);
      setUserProfile(null);
    }
  }, [client]);

  const handleNewConversation = useCallback(() => {
    setAiStateKey((prev) => prev + 1);
    setLastMetadata(null);
    setSelectedHistory(null);
  }, []);

  const handleSelectHistory = useCallback((item: any) => {
    setAiStateKey((prev) => prev + 1);
    setSelectedHistory(item);
    setLastMetadata(item.metadata);
  }, []);

  if (!client) {
    return (
      <ThemeProvider defaultTheme="dark">
        <LandingPage onLogin={handleLogin} isConnecting={isConnecting} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <Chat client={client} theme="str-chat__theme-dark">
        <WorkspaceLayout
          sidebar={
            <Sidebar
              collapsed={false}
              userProfile={userProfile}
              onLogout={handleLogout}
              onNewConversation={handleNewConversation}
              onSelectHistory={handleSelectHistory}
            />
          }
          main={
            <AIAssistantPanel
              key={aiStateKey}
              userId={userProfile.userId}
              initialData={selectedHistory}
              onMetadata={setLastMetadata}
            />
          }
          assistant={<ChatInterface metadata={lastMetadata} />}
        />
      </Chat>
    </ThemeProvider>
  );
}

export default App;
