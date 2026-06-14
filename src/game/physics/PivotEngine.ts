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
    private jackLength: number = 180;
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

        const rayCollisions = this.scene.matter.query.ray(
            bodies,
            this.player.body.position,
            { x: rayEndX, y: rayEndY }
        ) as RayCollision[];

        if (rayCollisions.length > 0) {
            const closestHit = rayCollisions[0];
            this.anchorPoint.set(closestHit.point.x, closestHit.point.y);

            this.isHooked = true;
            this.player.updateState("LAUNCHED");

            this.pivotConstraint = this.scene.matter.add.constraint(
                this.player.body,
                closestHit.body,
                closestHit.body.isStatic ? 0 : this.pointerVector.length(),
                0.2,
                {
                    pointA: { x: 0, y: 0 },
                    pointB: {
                        x: this.anchorPoint.x - closestHit.body.position.x,
                        y: this.anchorPoint.y - closestHit.body.position.y
                    }
                }
            );
        }
    }

    public updateEngineRoutines(): void {
        this.debugGraphics.clear();

        if (!this.isHooked || !this.pivotConstraint) return;

        this.debugGraphics.lineStyle(5, 0x00ffcc, 1);
        this.debugGraphics.lineBetween(this.player.x, this.player.y, this.anchorPoint.x, this.anchorPoint.y);
        this.debugGraphics.fillStyle(0xff3333, 1);
        this.debugGraphics.fillCircle(this.anchorPoint.x, this.anchorPoint.y, 6);

        const pointer = this.scene.input.activePointer;
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