'use client';

import { useState } from "react";
import GameCanvas from "@/src/components/GameCanvas";
import { authClient } from "@/src/lib/auth-client";

// Define the three screens our app can show
type AppState = 'menu' | 'playing' | 'leaderboard';

export default function Home() {
  const { data: session, isPending } = authClient.useSession();
  const [currentView, setCurrentView] = useState<AppState>('menu');

  const handleLogin = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleLogout = async () => {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.reload() } });
  };

  // --- STATE 1: LOADING ---
  if (isPending) {
    return (
      <main className="w-screen h-screen bg-black flex items-center justify-center">
        <span className="text-white font-mono text-xl animate-pulse">Loading Summit Jack...</span>
      </main>
    );
  }

  // --- STATE 2: NOT LOGGED IN ---
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

  // --- STATE 3: AUTHENTICATED ---
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">

      {/* Global Logout Button (Always in top right when logged in) */}
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

      {/* VIEW B: LEADERBOARD (Placeholder for now) */}
      {currentView === 'leaderboard' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-slate-900 text-white">
          <h2 className="text-4xl font-black mb-8">GLOBAL RANKINGS</h2>
          <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md text-center mb-8">
            <p className="text-slate-400 font-mono">Database connection pending...</p>
          </div>
          <button
            onClick={() => setCurrentView('menu')}
            className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-lg font-bold transition-transform active:scale-95"
          >
            Back to Menu
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

          {/* The game only mounts when they click Play! */}
          <GameCanvas />
        </>
      )}

    </main>
  );
}