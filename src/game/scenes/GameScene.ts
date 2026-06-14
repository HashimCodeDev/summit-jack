import { Scene } from "phaser";
import { Player } from "../entities/Player";
import { BasePlatform } from "../terrain/BasePlatform";
import { PivotEngine } from "../physics/PivotEngine";

export class GameScene extends Scene {
    private player!: Player;
    private pivotEngine!: PivotEngine;
    private platforms: BasePlatform[] = [];

    private heightText!: Phaser.GameObjects.Text;
    private maxHeightText!: Phaser.GameObjects.Text;

    private groundReferenceY: number = 1200;
    private static maxAltitudeMeters: number = 0;

    constructor() {
        super("GameScene");
    }

    init() {
        try {
            const saved = localStorage.getItem('maxAltitude');
            if (saved) {
                const parsed = parseInt(saved, 10);
                // Only overwrite if the saved score is a valid number AND higher
                if (!isNaN(parsed) && parsed > GameScene.maxAltitudeMeters) {
                    GameScene.maxAltitudeMeters = parsed;
                }
            }
        } catch (e) {
            // Silently ignore if the browser is blocking localStorage
        }
    }
    create() {
        this.matter.world.setBounds(0, -100000, 20000, 100000 + this.groundReferenceY);
        this.matter.world.setGravity(0, 1.4);

        const standardProps = { friction: 0.9, restitution: 0.05 };

        // 1. THE SPAWN PEDESTAL: Shrunk down to a tiny block so you can easily swing off the edge
        this.platforms.push(
            new BasePlatform(this, 200, this.groundReferenceY + 20, 80, 40, 0x228B22, standardProps)
        );

        // Initialize player floating slightly above the pedestal
        this.player = new Player(this, 200, this.groundReferenceY - 50);
        this.pivotEngine = new PivotEngine(this, this.player);

        // 2. THE TUTORIAL ANCHOR: Placed at a perfect diagonal angle for the first swing
        this.platforms.push(
            new BasePlatform(this, 450, this.groundReferenceY - 150, 120, 40, 0x334455, standardProps)
        );

        // 3. IN-WORLD TUTORIAL TEXT: Guides the player's eyes and actions perfectly
        this.add.text(250, this.groundReferenceY - 230, "1. Tap & HOLD here to Hook", {
            fontSize: "24px",
            fontFamily: "monospace",
            color: "#00ffcc",
            stroke: "#000000",
            strokeThickness: 4
        });

        this.add.text(440, this.groundReferenceY - 210, "↓", {
            fontSize: "24px",
            fontFamily: "monospace",
            color: "#00ffcc",
            stroke: "#000000",
            strokeThickness: 4
        });

        this.add.text(350, this.groundReferenceY - 50, "2. Keep holding to swing\n3. Release to LAUNCH!", {
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#ffffff",
            align: "center",
            stroke: "#000000",
            strokeThickness: 3
        });

        // 4. THE ASCENT: Spacing out the rest of the mountain to catch your launch
        this.platforms.push(
            new BasePlatform(this, 800, this.groundReferenceY - 300, 150, 30, 0x445566, standardProps)
        );
        this.platforms.push(
            new BasePlatform(this, 1150, this.groundReferenceY - 450, 150, 30, 0x445566, standardProps)
        );
        this.platforms.push(
            new BasePlatform(this, 1550, this.groundReferenceY - 650, 200, 150, 0x553344, standardProps)
        );

        // Camera setup
        this.cameras.main.setBounds(0, -100000, 20000, 100000 + this.groundReferenceY);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1, -100, 150);

        // Static UI Height Tracker
        this.heightText = this.add.text(20, 20, "Altitude: 0m", {
            fontSize: "24px",
            fontFamily: "monospace",
            color: "#ffffff"
        }).setScrollFactor(0);

        // Max Height Tracker
        this.maxHeightText = this.add.text(20, 50, `Max Height: ${GameScene.maxAltitudeMeters}m`, {
            fontSize: "18px",
            fontFamily: "monospace",
            color: "#FF0000"
        }).setScrollFactor(0);;
    }

    update(time: number, delta: number) {

        // Update the pivot engine routines
        if (this.pivotEngine) {
            this.pivotEngine.updateEngineRoutines();
        }

        if (this.player) {
            // --- FAIL CONDITIONAL CHECK ---
            // If the player falls past the initial base ground zone, execute fail loop
            if (this.player.y > this.groundReferenceY + 400) {
                this.handlePlayerFailure();
                return;
            }

            // Altimeter calculation routines
            if (this.heightText) {
                const pixelHeight = (this.groundReferenceY - this.player.y) - 20;
                const altitudeMeters = Math.max(0, Math.floor(pixelHeight / 10));

                this.heightText.setText(`Altitude: ${altitudeMeters}m`);

                if (altitudeMeters > GameScene.maxAltitudeMeters) {
                    GameScene.maxAltitudeMeters = altitudeMeters;

                    // Bulletproof persistent save
                    localStorage.setItem('maxAltitude', GameScene.maxAltitudeMeters.toString());

                    this.maxHeightText.setText(`Max Height: ${GameScene.maxAltitudeMeters}m`);
                }
            }
        }
    }

    private handlePlayerFailure() {
        // Destroy the previous engine runtime references to safely unbind old event listeners 
        // and eliminate pointer registration leaks
        if (this.pivotEngine) {
            this.pivotEngine.destroy();
        }

        // Trigger a native scene reload framework sequence
        this.scene.restart();
    }
}