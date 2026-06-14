'use client';

import { motion } from "framer-motion";

interface AnimatedButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    variant: "primary" | "secondary";
}

export default function AnimatedButton({ children, onClick, variant }: AnimatedButtonProps) {
    const isPrimary = variant === "primary";

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`group relative px-8 py-4 font-mono font-black text-sm tracking-[0.2em] uppercase rounded-xl transition-all duration-300 overflow-hidden ${isPrimary
                ? "bg-linear-to-r from-cyan-500 to-violet-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] border border-cyan-400/30"
                : "bg-slate-900/60 text-slate-300 hover:text-white border border-slate-800 hover:border-violet-500/40 backdrop-blur-md"
                }`}
        >
            {/* Shimmer Light Flare Layer */}
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}