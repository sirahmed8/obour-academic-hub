import ChatClient from "./ChatClient";

export const metadata = {
  title: "Global Chat - Obour Academic Hub",
  description: "Connect and chat with all students in real-time.",
};

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-background">
      <ChatClient />
    </main>
  );
}
