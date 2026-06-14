'use client';
import GameCanvas from "@/src/components/GameCanvas";


export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameCanvas />
    </main>
  );
}