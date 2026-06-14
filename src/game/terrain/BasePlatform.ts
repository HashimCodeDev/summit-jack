// src/game/terrain/BasePlatform.ts

import Phaser from "phaser";
import { COLLISION_CHANNELS } from "../config/physics-channels";

export interface SurfaceProperties {
    friction: number;        // Tangential resistance for anchoring
    restitution: number;     // Bounciness on direct impact
    isSlippery?: boolean;    // Custom modifier flag for the Frozen biome
}

export class BasePlatform extends Phaser.GameObjects.Rectangle {
    public override body!: MatterJS.BodyType;
    public surfaceProps: SurfaceProperties;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        width: number,
        height: number,
        fillColor: number,
        props: SurfaceProperties
    ) {
        super(scene, x, y, width, height, fillColor);
        this.surfaceProps = props;

        scene.add.existing(this);

        const bodyConfig: Phaser.Types.Physics.Matter.MatterBodyConfig = {
            isStatic: true,
            friction: props.friction,
            restitution: props.restitution,
            label: "TerrainPlatform",
            collisionFilter: {
                category: COLLISION_CHANNELS.TERRAIN,
                mask: COLLISION_CHANNELS.PLAYER | COLLISION_CHANNELS.JACK_TIP
            }
        };

        scene.matter.add.gameObject(this, bodyConfig);
    }
}