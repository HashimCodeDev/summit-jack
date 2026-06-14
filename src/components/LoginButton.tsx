"use client";

import { authClient } from "@/src/lib/auth-client";

export default function LoginButton() {
    // This hook automatically checks if the user is already logged in
    const { data: session, isPending } = authClient.useSession();

    const handleLogin = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/", // Where to redirect after logging in
        });
    };

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.reload(); // Refresh to clear the game state
                },
            },
        });
    };

    if (isPending) {
        return <div className="text-white">Loading...</div>;
    }

    if (session) {
        return (
            <div className="flex items-center gap-4 p-4 z-10 absolute top-0 right-0">
                <span className="text-white font-mono">
                    Welcome, {session.user.name}
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold"
                >
                    Log Out
                </button>
            </div>
        );
    }

    return (
        <div className="absolute top-4 right-4 z-10">
            <button
                onClick={handleLogin}
                className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition-colors"
            >
                Sign in with Google
            </button>
        </div>
    );
}