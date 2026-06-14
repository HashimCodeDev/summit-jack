// src/game/scenes/GameScene.ts

import { Scene } from "phaser";
import { Player } from "../entities/Player";
import { BasePlatform } from "../terrain/BasePlatform";
import { PivotEngine } from "../physics/PivotEngine";

export class GameScene extends Scene {
    private player!: Player;
    private pivotEngine!: PivotEngine;
    private platforms: BasePlatform[] = [];

    private heightText!: Phaser.GameObjects.Text;
    private groundReferenceY: number = 1200;

    constructor() {
        super("GameScene");
    }

    create() {
        // 1. Expand world boundaries to support a massive diagonal right-and-up layout space
        this.matter.world.setBounds(0, -100000, 20000, 100000 + this.groundReferenceY);
        this.matter.world.setGravity(0, 1.4);

        // Baseline structural surface properties
        const standardProps = { friction: 0.9, restitution: 0.05 };

        // 2. Spawn point platform (Spans horizontally under the player so you don't fall at start)
        this.platforms.push(
            new BasePlatform(this, 300, this.groundReferenceY + 20, 800, 40, 0x111111, standardProps)
        );

        // 3. Initialize player right above the starting ground floor
        this.player = new Player(this, 200, this.groundReferenceY - 100);
        this.pivotEngine = new PivotEngine(this, this.player);

        // 4. Construct a diagonal, step-like mountain layout climbing toward the top right
        // Each ledge is positioned within the 180px physical reach of the jack
        this.platforms.push(
            new BasePlatform(this, 400, this.groundReferenceY - 120, 180, 30, 0x334455, standardProps)
        );
        this.platforms.push(
            new BasePlatform(this, 600, this.groundReferenceY - 260, 180, 30, 0x334455, standardProps)
        );
        this.platforms.push(
            new BasePlatform(this, 820, this.groundReferenceY - 400, 180, 30, 0x445566, standardProps)
        );
        this.platforms.push(
            new BasePlatform(this, 1050, this.groundReferenceY - 550, 180, 30, 0x445566, standardProps)
        );

        // Introducing a massive right-side cliff face obstacle to swing around
        this.platforms.push(
            new BasePlatform(this, 1350, this.groundReferenceY - 750, 300, 250, 0x553344, standardProps)
        );

        this.platforms.push(
            new BasePlatform(this, 1600, this.groundReferenceY - 950, 200, 40, 0x664455, standardProps)
        );

        // 5. Update camera tracking to follow both X and Y axis progression
        this.cameras.main.setBounds(0, -100000, 20000, 100000 + this.groundReferenceY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1, -100, 150);

        this.heightText = this.add.text(20, 20, "Altitude: 0m", {
            fontSize: "24px",
            fontFamily: "monospace",
            color: "#ffffff"
        }).setScrollFactor(0);
    }
}