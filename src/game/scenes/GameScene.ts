// src/game/scenes/GameScene.ts

import { Scene } from "phaser";
import { Player } from "../entities/Player";
import { LaunchSystem } from "../systems/LaunchSystem";
import { GAME_CONSTANTS } from "../config/game-constants";

export class GameScene extends Scene {
    private player!: Player;
    private launchSystem!: LaunchSystem;

    // UI HUD Metrics Tracker Layer
    private heightText!: Phaser.GameObjects.Text;
    private maxAltitudeText!: Phaser.GameObjects.Text;

    private highestAltitudeReached: number = 0;
    private groundReferenceY: number = 1500; // Arbitrary coordinate baseline for height measurements

    constructor() {
        super("GameScene");
    }

    create() {
        console.log("Game Scene Loaded");

        // 1. Extend Matter.js boundary sizes dynamically to allow vertical ascension paths safely
        this.matter.world.setBounds(0, -100000, 2000, 100000 + this.groundReferenceY);
        this.matter.world.setGravity(0, GAME_CONSTANTS.WORLD.GRAVITY_Y);

        // Temporary developmental baseline platform structural anchor block
        const floorPlatform = this.matter.add.rectangle(1000, this.groundReferenceY + 50, 2000, 100, {
            isStatic: true,
            label: "GroundPlatform"
        });

        // 2. Instantiate Player character entity modules
        this.player = new Player(this, 1000, this.groundReferenceY - 100);

        // 3. Attach Input Handling Controller Systems
        this.launchSystem = new LaunchSystem(this, this.player);

        // 4. Configure Camera systems to cleanly lock along high vertical axises
        this.cameras.main.setBounds(0, -100000, 2000, 100000 + this.groundReferenceY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1, 0, 100);
        this.cameras.main.setZoom(1.0);

        // 5. Initialize Minimalist High Performance Overlay Metrics Displays
        this.initializeAltitudeHUD();
    }

    private initializeAltitudeHUD(): void {
        this.heightText = this.add.text(20, 20, "Altitude: 0m", {
            fontSize: "24px",
            fontFamily: "monospace",
            color: "#ffffff"
        }).setScrollFactor(0); // Freeze UI overlay text relative to dynamic viewports

        this.maxAltitudeText = this.add.text(20, 50, "Max Altitude: 0m", {
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#00ffcc"
        }).setScrollFactor(0);
    }

    override update() {
        // Continuous verification fallback logic loop routines
        if (!this.player || !this.player.body) return;

        // 1. Calculate Realtime Altitude Tracker values
        // Note: As you ascend higher in standard 2D view spaces, the raw Y coordinate drops into deep negatives.
        const calculatedAltitude = Math.max(0, Math.floor((this.groundReferenceY - this.player.y) / 10));
        this.heightText.setText(`Altitude: ${calculatedAltitude}m`);

        if (calculatedAltitude > this.highestAltitudeReached) {
            this.highestAltitudeReached = calculatedAltitude;
            this.maxAltitudeText.setText(`Max Altitude: ${this.highestAltitudeReached}m`);
        }

        // 2. Process Automation State Machines checking airborne velocities vs ground interactions
        const currentVelocityY = this.player.body.velocity.y;

        if (this.player.playerState === "LAUNCHED" && currentVelocityY > 0.5) {
            // Once structural upward propulsion vector decays into downward vectors, flip into FALLING states
            this.player.updateState("FALLING");
        }

        // Fail-safe reset criteria: if it settles perfectly to a stop on the ground platform, put back to IDLE
        if (this.player.playerState === "FALLING" && Math.abs(currentVelocityY) < 0.05) {
            this.player.updateState("IDLE");
            this.player.freeze();
        }
    }
}