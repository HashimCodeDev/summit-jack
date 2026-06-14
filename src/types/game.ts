export enum GameView {
    MENU = "MENU",
    INTRO = "INTRO",
    LEADERBOARD = "LEADERBOARD",
    PLAYING = "PLAYING"
}

export interface LeaderboardPlayer {
    _id: string;
    name: string;
    image?: string;
    maxAltitude: number;
}