export class RockDebris extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color = 0x555555, gravity = false) {
    width = width || Phaser.Math.Between(5, 15);
    height = height || Phaser.Math.Between(5, 15);
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setVelocityX(Phaser.Math.Between(-300, 300));
    this.body.setVelocityY(Phaser.Math.Between(-200, 200));

    this.init();
  }
  init() {
    this.scene.tweens.add({
      targets: this,
      duration: 800,
      scale: { from: 1, to: 0 },
      onComplete: () => {
        this.destroy();
      },
    });
  }
}
