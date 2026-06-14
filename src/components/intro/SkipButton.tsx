'use client';

interface SkipButtonProps {
    onClick: () => void;
}

export default function SkipButton({ onClick }: SkipButtonProps) {
    return (
        <button
            onClick={(e) => {
                // Prevent clicking the button from bubbling up and triggering the parent div's onClick
                e.stopPropagation();
                onClick();
            }}
            className="group relative flex items-center gap-2 bg-black/40 hover:bg-violet-600/30 text-slate-300 hover:text-cyan-400 font-mono text-xs uppercase tracking-widest px-5 py-3 rounded-md border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 backdrop-blur-md overflow-hidden shadow-2xl select-none"
        >
            {/* Light sweep animation overlay effect on hover */}
            <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

            <span>Skip Sequence</span>

            <span className="text-[10px] bg-slate-900 group-hover:bg-cyan-950 px-1.5 py-0.5 rounded border border-slate-800 group-hover:border-cyan-500/20 text-slate-500 group-hover:text-cyan-400 transition-colors">
                SPACE
            </span>
        </button>
    );
}