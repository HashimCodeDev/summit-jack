'use client';

import { motion } from "framer-motion";
import ProfileCard from "./ProfileCard";
import MultiverseBackground from "./MultiverseBackground";
import AnimatedButton from "../shared/AnimatedButton";

interface MainMenuProps {
    onPlay: () => void;
    onOpenLeaderboard: () => void;
    onLogout: () => void;
    user: { name: string; image?: string };
}

export default function MainMenu({ onPlay, onOpenLeaderboard, onLogout, user }: MainMenuProps) {
    return (
        <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between p-8 z-10 select-none bg-radial-dark">
            <MultiverseBackground />

            {/* TOP BAR INFRASTRUCTURE */}
            <header className="w-full flex justify-between items-start z-20">
                <ProfileCard user={user} onLogout={onLogout} />
                <div className="flex gap-4">
                    <button className="p-3 rounded-lg bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all backdrop-blur-sm">
                        ⚙️
                    </button>
                </div>
            </header>

            {/* HERO HERO BRANDING CENTRIC SECTION */}
            <main className="w-full flex flex-col items-center justify-center my-auto z-20 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-6 group"
                >
                    {/* Multiverse Glowing Ring Aura */}
                    <div className="absolute inset-0 rounded-full bg-linear-to-tr from-violet-600 via-cyan-500 to-magenta-500 blur-3xl opacity-20 group-hover:opacity-35 transition-opacity duration-1000 scale-110 animate-pulse" />

                    {/* Massive Graphic Logo Node */}
                    <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/images/vortex.png')] bg-cover opacity-10 animate-[spin_60s_linear_infinite]" />
                        <div className="absolute w-4/5 h-4/5 rounded-full border border-dashed border-violet-500/20 animate-[spin_40s_linear_infinite_reverse]" />
                        <span className="text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400 tracking-tighter z-10 select-none">
                            Ω
                        </span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase font-sans mb-3 select-none"
                >
                    Tether<span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-violet-400 to-fuchsia-500">verse</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="font-mono text-xs md:text-sm text-cyan-400/70 tracking-[0.4em] uppercase mb-12 select-none"
                >
                    Quantum Singularity Climbing Loop
                </motion.p>

                {/* CALL TO ACTIONS */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="flex flex-col sm:flex-row items-center gap-6"
                >
                    <AnimatedButton onClick={onPlay} variant="primary">
                        INITIALIZE ASCENT
                    </AnimatedButton>
                    <AnimatedButton onClick={onOpenLeaderboard} variant="secondary">
                        LEADERBOARD TELEMETRY
                    </AnimatedButton>
                </motion.div>
            </main>

            {/* FOOTER METADATA ENGINE */}
            <footer className="w-full flex justify-between items-center z-20 font-mono text-[10px] text-slate-500 tracking-wider">
                <span>SYSTEM NODE: ACTIVE</span>
                <span>v2.0.26 // QUANTUM_BUILD</span>
            </footer>
        </div>
    );
}