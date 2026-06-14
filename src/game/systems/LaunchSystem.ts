// src/game/systems/LaunchSystem.ts

import Phaser from "phaser";
import { Player } from "../entities/Player";
import { GAME_CONSTANTS } from "../config/game-constants";

export class LaunchSystem {
    private scene: Phaser.Scene;
    private player: Player;

    // Performance pre-allocations: Prevents garbage collection stutter loops inside update loops
    private startPoint: Phaser.Math.Vector2;
    private currentPoint: Phaser.Math.Vector2;
    private dragVector: Phaser.Math.Vector2;
    private launchVelocity: Phaser.Math.Vector2;

    // Visual trajectory components
    private aimGraphics: Phaser.GameObjects.Graphics;
    private isDragging: boolean = false;

    constructor(scene: Phaser.Scene, player: Player) {
        this.scene = scene;
        this.player = player;

        // Initialize reusable vector memory layers
        this.startPoint = new Phaser.Math.Vector2();
        this.currentPoint = new Phaser.Math.Vector2();
        this.dragVector = new Phaser.Math.Vector2();
        this.launchVelocity = new Phaser.Math.Vector2();

        // Single canvas allocation for aiming display lines
        this.aimGraphics = this.scene.add.graphics();
        this.aimGraphics.setDepth(100);

        this.setupInputListeners();
    }

    private setupInputListeners(): void {
        // Phaser automatically unifies mouse clicks and touch pointers seamlessly
        this.scene.input.on("pointerdown", this.onPointerDown, this);
        this.scene.input.on("pointermove", this.onPointerMove, this);
        this.scene.input.on("pointerup", this.onPointerUp, this);
    }

    private onPointerDown(pointer: Phaser.Input.Pointer): void {
        // Only allow targeting inputs if the player is safely rooted on stable terrain
        if (this.player.playerState !== "IDLE") return;

        this.isDragging = true;
        this.startPoint.set(pointer.x, pointer.y);
        this.player.updateState("AIMING");
    }

    private onPointerMove(pointer: Phaser.Input.Pointer): void {
        if (!this.isDragging) return;

        this.currentPoint.set(pointer.x, pointer.y);

        // Calculate raw input vector offset length
        this.dragVector.copy(this.currentPoint).subtract(this.startPoint);

        // Clamp drag input thresholds
        if (this.dragVector.length() > GAME_CONSTANTS.LAUNCH.MAX_DRAG_DISTANCE) {
            this.dragVector.setLength(GAME_CONSTANTS.LAUNCH.MAX_DRAG_DISTANCE);
        }

        this.renderAimIndicator();
    }

    private onPointerUp(): void {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.aimGraphics.clear();

        const dragDistance = this.dragVector.length();

        if (dragDistance < GAME_CONSTANTS.LAUNCH.MIN_DRAG_DISTANCE) {
            // Cancel input cleanly if drag distance isn't high enough
            this.player.updateState("IDLE");
            return;
        }

        // Mechanics inverted launch operation: player drags backwards, mechanical jack fires forwards!
        // Calculate percentage factor against maximum allowed drag limits
        const powerRatio = dragDistance / GAME_CONSTANTS.LAUNCH.MAX_DRAG_DISTANCE;
        const targetSpeed = GAME_CONSTANTS.LAUNCH.MIN_VELOCITY +
            (powerRatio * (GAME_CONSTANTS.LAUNCH.MAX_VELOCITY - GAME_CONSTANTS.LAUNCH.MIN_VELOCITY));

        // Derive inverse structural angle vector targeting forward flight trajectory
        this.launchVelocity.copy(this.dragVector).normalize().negate().scale(targetSpeed);

        // Execute physical launch operation
        this.player.updateState("LAUNCHED");
        this.scene.matter.body.setVelocity(this.player.body, {
            x: this.launchVelocity.x,
            y: this.launchVelocity.y
        });
    }

    private renderAimIndicator(): void {
        this.aimGraphics.clear();

        if (!this.isDragging || this.dragVector.length() === 0) return;

        // Draw interactive visual path vectors starting precisely from the center of the physical player body
        const originX = this.player.x;
        const originY = this.player.y;

        // Invert directional representation to cleanly visually communicate where the character will fly
        const visualTarget = new Phaser.Math.Vector2(originX, originY)
            .add(this.dragVector.clone().negate());

        const distance = this.dragVector.length();
        const maxDist = GAME_CONSTANTS.LAUNCH.MAX_DRAG_DISTANCE;

        // Dynamic styling transitions: green (low-tier charge) -> bright orange/red (maximum mechanical limit)
        const interpolationColor = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor(0x00ffcc), // Cool teal green
            Phaser.Display.Color.ValueToColor(0xff3333), // Stress red
            maxDist,
            distance
        );

        const hexColor = Phaser.Display.Color.GetColor(
            interpolationColor.r,
            interpolationColor.g,
            interpolationColor.b
        );

        // Render sleek targeting feedback structures
        this.aimGraphics.lineStyle(4, hexColor, 0.85);
        this.aimGraphics.lineBetween(originX, originY, visualTarget.x, visualTarget.y);

        // Render an endpoint target indicator circle tracking the calculated launch vector length
        this.aimGraphics.fillStyle(hexColor, 1);
        this.aimGraphics.fillCircle(visualTarget.x, visualTarget.y, 7);
    }

    public destroy(): void {
        this.scene.input.off("pointerdown", this.onPointerDown);
        this.scene.input.off("pointermove", this.onPointerMove);
        this.scene.input.off("pointerup", this.onPointerUp);
        this.aimGraphics.destroy();
    }
}