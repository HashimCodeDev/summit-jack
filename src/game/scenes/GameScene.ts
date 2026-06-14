import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    create() {
        console.log("Game Scene Loaded");

        this.cameras.main.setBackgroundColor("#1e293b");

        this.add.rectangle(
            400,
            300,
            200,
            100,
            0xff0000
        );

        this.add.text(
            100,
            100,
            "SUMMIT JACK",
            {
                fontSize: "48px",
                color: "#ffffff",
            }
        );
    }
}