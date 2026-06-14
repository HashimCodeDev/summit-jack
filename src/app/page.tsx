'use client';

import { useState, useEffect } from "react";
import GameCanvas from "@/src/components/GameCanvas";
import { authClient } from "@/src/lib/auth-client";

type AppState = 'menu' | 'playing' | 'leaderboard';

// Define the shape of our player data
interface LeaderboardPlayer {
  _id: string;
  name: string;
  image?: string;
  maxAltitude: number;
}

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [currentView, setCurrentView] = useState<AppState>('menu');

  // New state for the leaderboard
  const [leaders, setLeaders] = useState<LeaderboardPlayer[]>([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);

  // Automatically fetch the leaderboard whenever the view changes to 'leaderboard'
  useEffect(() => {
    if (currentView === 'leaderboard') {
      const fetchLeaderboard = async () => {
        setIsLoadingLeaders(true);
        try {
          const res = await fetch('/api/leaderboard');
          const data = await res.json();
          if (data.success) {
            setLeaders(data.leaderboard);
          }
        } catch (error) {
          console.error("Failed to load leaderboard", error);
        } finally {
          setIsLoadingLeaders(false);
        }
      };
      fetchLeaderboard();
    }
  }, [currentView]);

  const handleLogin = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleLogout = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  if (isPending) {
    return (
      <main className="w-screen h-screen bg-black flex items-center justify-center">
        <span className="text-white font-mono text-xl animate-pulse">Loading Summit Jack...</span>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="w-screen h-screen bg-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">SUMMIT JACK</h1>
        <p className="text-slate-400 mb-12">Hook. Swing. Climb.</p>
        <button
          onClick={handleLogin}
          className="bg-white text-black px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-200 transition-transform active:scale-95"
        >
          Sign in with Google to Play
        </button>
      </main>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">

      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 z-50 bg-red-500/80 hover:bg-red-500 text-white px-4 py-2 rounded font-bold backdrop-blur-sm"
      >
        Log Out
      </button>

      {/* VIEW A: MAIN MENU */}
      {currentView === 'menu' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-slate-900">
          <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">SUMMIT JACK</h1>
          <p className="text-green-400 mb-12 text-lg font-mono">
            Welcome back, {session.user.name}
          </p>

          <div className="flex gap-6">
            <button
              onClick={() => setCurrentView('playing')}
              className="bg-green-500 hover:bg-green-400 text-black px-10 py-4 rounded-lg font-black text-2xl transition-transform active:scale-95"
            >
              PLAY
            </button>
            <button
              onClick={() => setCurrentView('leaderboard')}
              className="bg-slate-700 hover:bg-slate-600 text-white px-10 py-4 rounded-lg font-bold text-2xl transition-transform active:scale-95"
            >
              Leaderboard
            </button>
          </div>
        </div>
      )}

      {/* VIEW B: THE LEADERBOARD */}
      {currentView === 'leaderboard' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-slate-900 text-white p-4">
          <h2 className="text-5xl font-black mb-8 text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-500">
            GLOBAL RANKINGS
          </h2>

          <div className="bg-slate-800 p-6 rounded-xl w-full max-w-lg mb-8 shadow-2xl border border-slate-700 h-100 overflow-y-auto">
            {isLoadingLeaders ? (
              <div className="flex justify-center items-center h-full">
                <span className="animate-pulse text-slate-400 font-mono">Connecting to satellite...</span>
              </div>
            ) : leaders.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <span className="text-slate-400 font-mono">No climbers yet. Be the first!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {leaders.map((player, index) => (
                  <div
                    key={player._id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      // Highlight the current user in the list
                      player._id === session.user.id
                        ? 'bg-slate-600 border border-green-500/50'
                        : 'bg-slate-700/50'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank Number */}
                      <span className={`font-black text-xl w-6 ${index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-slate-300' :
                          index === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                        #{index + 1}
                      </span>

                      {/* Avatar (if they have one via Google) */}
                      {player.image ? (
                        <img src={player.image} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-600" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-600" />
                      )}

                      {/* Name */}
                      <span className="font-bold text-lg truncate max-w-37.5">
                        {player.name}
                      </span>
                    </div>

                    {/* Score */}
                    <span className="font-mono text-green-400 font-bold text-xl">
                      {player.maxAltitude}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentView('menu')}
            className="bg-slate-700 hover:bg-slate-600 px-8 py-4 rounded-lg font-bold transition-transform active:scale-95 text-lg"
          >
            Return to Basecamp
          </button>
        </div>
      )}

      {/* VIEW C: THE GAME */}
      {currentView === 'playing' && (
        <>
          <button
            onClick={() => setCurrentView('menu')}
            className="absolute top-4 left-4 z-50 bg-slate-800/80 hover:bg-slate-700 text-white px-4 py-2 rounded font-bold backdrop-blur-sm"
          >
            Quit to Menu
          </button>
          <GameCanvas />
        </>
      )}

    </main>
  );
}