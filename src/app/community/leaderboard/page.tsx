import LeaderboardClient from "./LeaderboardClient";

export const metadata = {
  title: "Leaderboard - Obour Academic Hub",
  description: "Check your rank and compete with others on the Obour Academic Hub leaderboard.",
};

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <LeaderboardClient />
    </main>
  );
}
