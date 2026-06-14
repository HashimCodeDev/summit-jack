import Phaser from "phaser";
import { GameScene } from "../scenes/GameScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,

    parent: "game-container",

    backgroundColor: "#87ceeb",

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    physics: {
        default: "matter",
        matter: {
            gravity: {
                x: 0,
                y: 1,
            },
            debug: true,
        },
    },

    scene: [GameScene],
};