import Phaser from "phaser";
import { GAME_CONSTANTS } from "../config/game-constants";

export type PlayerState = "IDLE" | "AIMING" | "LAUNCHED" | "FALLING";

export class Player extends Phaser.GameObjects.Container {
    public override body!: MatterJS.BodyType;
    public playerState: PlayerState = "IDLE";

    private spriteCircle: Phaser.GameObjects.Arc;
    private coreBodyRadius: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        this.coreBodyRadius = GAME_CONSTANTS.PLAYER.RADIUS;

        // Visual representation for development placeholder
        // Using a built-in Geometric Arc avoids generating premature draw calls for missing textures
        this.spriteCircle = scene.add.arc(0, 0, this.coreBodyRadius, 0, 360, false, 0xffffff);
        //this.spriteCircle.setStrokeStyle(3, 0x00ffcc); // Neon accent highlight
        this.add(this.spriteCircle);

        // Add container to the scene
        scene.add.existing(this);

        // Set up Matter.js physics body configuration
        const targetConfig: Phaser.Types.Physics.Matter.MatterBodyConfig = {
            shape: { type: 'circle', radius: this.coreBodyRadius },
            density: GAME_CONSTANTS.PLAYER.DENSITY,
            friction: GAME_CONSTANTS.PLAYER.FRICTION,
            frictionAir: GAME_CONSTANTS.PLAYER.FRICTION_AIR,
            restitution: GAME_CONSTANTS.PLAYER.BOUNCE,
            label: "PlayerBody"
        };

        scene.matter.add.gameObject(this, targetConfig);

        // Prevent player entity from infinitely spinning like a loose wheel unless structurally necessary
        this.scene.matter.body.setInertia(this.body, Infinity);
    }

    public updateState(newState: PlayerState): void {
        if (this.playerState === newState) return;
        this.playerState = newState;
    }

    /**
     * Resets visual coordinates or forces completely stationary states safely.
     */
    public freeze(): void {
        this.scene.matter.body.setVelocity(this.body, { x: 0, y: 0 });
        this.scene.matter.body.setAngularVelocity(this.body, 0);
    }
}