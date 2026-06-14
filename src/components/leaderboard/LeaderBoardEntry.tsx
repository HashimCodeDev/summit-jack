'use client';

import { memo } from "react";
import { motion } from "framer-motion";
import { LeaderboardPlayer } from "@/src/types/game";

interface LeaderboardEntryProps {
    player: LeaderboardPlayer;
    rank: number;
    isCurrentUser: boolean;
}

function LeaderboardEntry({ player, rank, isCurrentUser }: LeaderboardEntryProps) {
    const getRankStyles = (r: number) => {
        switch (r) {
            case 1: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
            case 2: return "bg-slate-300/10 text-slate-300 border-slate-400/20";
            case 3: return "bg-amber-600/10 text-amber-500 border-amber-700/20";
            default: return "bg-slate-950/40 text-slate-400 border-slate-800/40";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${isCurrentUser
                ? "bg-linear-to-r from-violet-950/40 to-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                : "bg-slate-900/30 border-slate-800/60 hover:border-slate-700/60"
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Ranking Token Badge */}
                <div className={`w-8 h-8 rounded-lg border font-mono text-xs font-black flex items-center justify-center ${getRankStyles(rank)}`}>
                    #{rank}
                </div>

                {/* Profile Vector Frame */}
                {player.image ? (
                    <img src={player.image} alt="" className="w-9 h-9 rounded-md object-cover border border-slate-800" />
                ) : (
                    <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700" />
                )}

                <span className={`text-sm font-bold tracking-tight ${isCurrentUser ? "text-cyan-300" : "text-slate-300"}`}>
                    {player.name} {isCurrentUser && <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded ml-1 font-mono tracking-normal uppercase">You</span>}
                </span>
            </div>

            {/* Score Data Endpoint */}
            <div className="text-right">
                <span className="font-mono text-base font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-violet-400">
                    {player.maxAltitude.toLocaleString()}m
                </span>
            </div>
        </motion.div>
    );
}

export default memo(LeaderboardEntry);