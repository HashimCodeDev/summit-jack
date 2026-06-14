'use client';

interface ProfileCardProps {
    user: { name: string; image?: string };
    onLogout: () => void;
}

export default function ProfileCard({ user, onLogout }: ProfileCardProps) {
    return (
        <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md shadow-2xl">
            {user.image ? (
                <img src={user.image} alt={user.name} className="w-11 h-11 rounded-lg border border-cyan-500/30 object-cover" />
            ) : (
                <div className="w-11 h-11 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white uppercase">
                    {user.name.charAt(0)}
                </div>
            )}
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-200 tracking-tight leading-none mb-1">
                    {user.name}
                </span>
                <button
                    onClick={onLogout}
                    className="text-[10px] font-mono text-left text-magenta-400 hover:text-magenta-300 tracking-widest uppercase transition-colors"
                >
                    Disconnect Node
                </button>
            </div>
        </div>
    );
}