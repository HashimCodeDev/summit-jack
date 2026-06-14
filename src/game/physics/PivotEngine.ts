// src/game/physics/PivotEngine.ts

import Phaser from "phaser";
import { Player } from "../entities/Player";
import { COLLISION_CHANNELS } from "../config/physics-channels";

interface RayCollision extends MatterJS.ICollisionData {
    point: { x: number; y: number };
    body: MatterJS.BodyType;
}

export class PivotEngine {
    private scene: Phaser.Scene;
    private player: Player;

    private pivotConstraint: MatterJS.ConstraintType | null = null;
    private anchorPoint: Phaser.Math.Vector2;
    private pointerVector: Phaser.Math.Vector2;

    private isHooked: boolean = false;
    private jackLength: number = 300; // Set to 300 so you can comfortably reach the first platform
    private debugGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        this.anchorPoint = new Phaser.Math.Vector2();
        this.pointerVector = new Phaser.Math.Vector2();

        this.debugGraphics = this.scene.add.graphics().setDepth(99);

        this.scene.matter.body.set(this.player.body, "collisionFilter", {
            category: COLLISION_CHANNELS.PLAYER,
            mask: COLLISION_CHANNELS.TERRAIN
        });

        this.setupInputBindings();
    }

    private setupInputBindings(): void {
        // Pass 'true' to indicate this is a fresh, initial tap
        this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.attemptAnchor(pointer, true), this);
        this.scene.input.on("pointerup", this.releaseAnchor, this);
    }

    private attemptAnchor(pointer: Phaser.Input.Pointer, isInitialTap: boolean = false): void {
        if (this.isHooked) return;

        this.pointerVector.set(pointer.worldX - this.player.x, pointer.worldY - this.player.y);

        if (this.pointerVector.length() > this.jackLength) {
            this.pointerVector.setLength(this.jackLength);
        }

        const rayEndX = this.player.x + this.pointerVector.x;
        const rayEndY = this.player.y + this.pointerVector.y;

        const bodies = this.scene.matter.world.getAllBodies().filter(
            (b: MatterJS.BodyType) => b.collisionFilter?.category === COLLISION_CHANNELS.TERRAIN
        );

        const rayCollisions = this.scene.matter.query.ray(
            bodies,
            this.player.body.position,
            { x: rayEndX, y: rayEndY }
        ) as RayCollision[];

        if (rayCollisions.length > 0) {
            const closestHit = rayCollisions[0];
            const platformBody = closestHit.body;

            // --- 1. GROUND PISTON HOP ---
            // If the platform we clicked is below the player's center-mass
            if (platformBody.position.y > this.player.body.position.y + 15) {
                if (isInitialTap) {
                    const hopDirectionX = this.pointerVector.x > 0 ? 1 : -1;

                    // Switch from applyForce to setVelocity for a guaranteed explosive jump!
                    const jumpVelocityX = 8 * hopDirectionX;
                    const jumpVelocityY = -16; // Massive instant upward speed

                    this.scene.matter.body.setVelocity(
                        this.player.body as MatterJS.BodyType,
                        { x: jumpVelocityX, y: jumpVelocityY }
                    );

                    this.player.updateState("LAUNCHED");
                }
                return; // Stop here! Do not hook a rope to the floor.
            }

            // --- AIR SWING HOOK ---
            const startPoint = new Phaser.Math.Vector2(this.player.body.position.x, this.player.body.position.y);
            const endPoint = new Phaser.Math.Vector2(rayEndX, rayEndY);

            this.anchorPoint.set(platformBody.position.x, platformBody.position.y);

            this.isHooked = true;
            this.player.updateState("LAUNCHED");

            this.pivotConstraint = this.scene.matter.add.constraint(
                this.player.body as MatterJS.BodyType,
                platformBody,
                this.pointerVector.length(),
                0.2,
                {
                    pointA: { x: 0, y: 0 },
                    pointB: { x: 0, y: 0 }
                }
            );
        }
    }

    public updateEngineRoutines(): void {
        this.debugGraphics.clear();
        const pointer = this.scene.input.activePointer;

        // 1. Draw your max reach circle
        this.debugGraphics.lineStyle(2, 0xffffff, 0.2);
        this.debugGraphics.strokeCircle(this.player.x, this.player.y, this.jackLength);

        // 2. The Yellow Aiming Laser (Allows drag-to-scan without hopping)
        if (pointer.isDown && !this.isHooked) {
            this.attemptAnchor(pointer, false); // Scans for a wall hook while dragging

            this.pointerVector.set(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
            if (this.pointerVector.length() > this.jackLength) {
                this.pointerVector.setLength(this.jackLength);
            }
            const previewX = this.player.x + this.pointerVector.x;
            const previewY = this.player.y + this.pointerVector.y;

            this.debugGraphics.lineStyle(3, 0xffcc00, 0.5);
            this.debugGraphics.lineBetween(this.player.x, this.player.y, previewX, previewY);
        }

        // 3. Early return if not hooked
        if (!this.isHooked || !this.pivotConstraint) return;

        // 4. Draw the actual swinging rope and apply physics
        this.debugGraphics.lineStyle(5, 0x00ffcc, 1);
        this.debugGraphics.lineBetween(this.player.x, this.player.y, this.anchorPoint.x, this.anchorPoint.y);
        this.debugGraphics.fillStyle(0xff3333, 1);
        this.debugGraphics.fillCircle(this.anchorPoint.x, this.anchorPoint.y, 6);

        if (pointer.isDown) {
            const swingRadius = new Phaser.Math.Vector2(
                this.player.x - this.anchorPoint.x,
                this.player.y - this.anchorPoint.y
            );
            const tangent = new Phaser.Math.Vector2(-swingRadius.y, swingRadius.x).normalize();

            const driveForce = 0.01; // Adjust this value to control swing acceleration

            this.scene.matter.body.applyForce(
                this.player.body,
                this.player.body.position,
                { x: tangent.x * driveForce, y: tangent.y * driveForce }
            );
        }
    }

    private releaseAnchor(): void {
        if (!this.isHooked) return;

        this.isHooked = false;
        if (this.pivotConstraint) {
            this.scene.matter.world.remove(this.pivotConstraint);
            this.pivotConstraint = null;
        }

        this.player.updateState("FALLING");
    }

    public destroy(): void {
        this.scene.input.off("pointerdown", this.attemptAnchor);
        this.scene.input.off("pointerup", this.releaseAnchor);
        this.releaseAnchor();
        this.debugGraphics.destroy();
    }
}