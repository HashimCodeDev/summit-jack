import Phaser from "phaser";

export class Mountain {
    constructor(scene: Phaser.Scene) {
        const platforms = [
            [400, 700],
            [650, 500],
            [900, 250],
            [1200, 100],
        ];

        platforms.forEach(([x, y]) => {
            const rect = scene.add.rectangle(
                x,
                y,
                250,
                30,
                0x444444
            );

            scene.matter.add.gameObject(rect, {
                isStatic: true,
            });
        });
    }
}