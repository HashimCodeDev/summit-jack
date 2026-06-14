import Phaser from "phaser";

export class Player {
    sprite: Phaser.Physics.Matter.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.sprite = scene.matter.add.image(x, y, "player");

        this.sprite.setCircle(20);
        this.sprite.setTint(0xff0000);
    }
}