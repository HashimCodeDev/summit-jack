// src/game/physics/PivotEngine.ts

import Phaser from "phaser";
import { Query } from "matter-js"; // Explicitly imported to prevent Phaser wrapper crashes
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
    private jackLength: number = 300; // Bumped up from 180 so it can easily reach platforms on mobile
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
        this.scene.input.on("pointerdown", this.attemptAnchor, this);
        this.scene.input.on("pointerup", this.releaseAnchor, this);
    }

    private attemptAnchor(pointer: Phaser.Input.Pointer): void {
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

        // Using native matter-js Query to ensure the raycast executes properly
        const rayCollisions = Query.ray(
            bodies as any[],
            this.player.body.position,
            { x: rayEndX, y: rayEndY }
        ) as unknown as RayCollision[];

        if (rayCollisions.length > 0) {
            const closestHit = rayCollisions[0];
            const platformBody = closestHit.body;

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

        // 1. ALWAYS draw a faint boundary circle so you can see your maximum reach on the screen
        this.debugGraphics.lineStyle(2, 0xffffff, 0.2);
        this.debugGraphics.strokeCircle(this.player.x, this.player.y, this.jackLength);

        // 2. Allow DRAGGING to actively scan for a hook like a laser pointer
        if (pointer.isDown && !this.isHooked) {
            this.attemptAnchor(pointer);

            // Draw a yellow preview aiming laser
            this.pointerVector.set(pointer.worldX - this.player.x, pointer.worldY - this.player.y);
            if (this.pointerVector.length() > this.jackLength) {
                this.pointerVector.setLength(this.jackLength);
            }
            const previewX = this.player.x + this.pointerVector.x;
            const previewY = this.player.y + this.pointerVector.y;

            this.debugGraphics.lineStyle(3, 0xffcc00, 0.5);
            this.debugGraphics.lineBetween(this.player.x, this.player.y, previewX, previewY);
        }

        // 3. Early return goes here AFTER drawing the aiming graphics
        if (!this.isHooked || !this.pivotConstraint) return;

        // 4. Render active hook line and drive force
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

            const driveForce = 0.08;

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