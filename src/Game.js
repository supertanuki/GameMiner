import Phaser from "phaser";
import { RockDebris } from "./RockDebris";

const PreviewMessage = {
  1: "Appuyez sur espace lorsque l'indicateur est dans la zone rouge.",
  2: "Appuyez sur espace et relâcher au bon moment !",
  3: "Maintenant, répétez les appuis sur la touche espace !",
};

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  preload() {
    this.load.atlas("miner", "img/miner/miner.png", "img/miner/miner.json");
    this.load.atlas(
      "miner-end",
      "img/miner/miner-end.png",
      "img/miner/miner-end.json"
    );
  }

  create() {
    this.phase = 1;
    this.phase1EndScore = 6;
    this.try = 0;
    this.phase1MaxTry = 20;
    this.timer = 10;

    this.score = 0;
    this.previousScore = 0;
    this.screenWidth = this.cameras.main.width;
    this.screenHeight = this.cameras.main.height;
    this.progressBarValue = 0;
    this.direction = 1;
    this.showingResult = false;
    this.waitingForPhaseStarting = true;
    this.currentStep = 1;

    this.timerMessage = null;
    this.timerTimer = null;

    this.phase2press = false;
    this.phase2ShowingIndicator = false;
    this.phase2PreTimerInit = 2;
    this.phase2PreTimer = this.phase2PreTimerInit;
    this.phase2TimerInit = 5;
    this.phase2Timer = this.phase2TimerInit;
    this.endPhase2Timer = false;
    this.indicatorPhaseWidthInit = 300;
    this.indicatorPhaseWidth = this.indicatorPhaseWidthInit;

    this.anims.create({
      key: "miner-digging",
      frames: this.anims.generateFrameNames("miner", {
        start: 5,
        end: 20,
        prefix: "frame_",
        zeroPad: 3,
      }),
      repeat: -1,
      frameRate: 20,
    });

    this.anims.create({
      key: "miner-end",
      frames: this.anims.generateFrameNames("miner-end", {
        start: 1,
        end: 29,
        prefix: "frame_",
      }),
      repeat: 0,
      frameRate: 20,
    });

    this.miner = this.physics.add.sprite(
      this.screenWidth / 2,
      this.screenHeight / 2,
      "miner"
    );
    this.miner.setScale(0.5);
    this.updateMiner();

    this.indicatorPosition = 450;
    this.indicator = this.add.graphics({ fillStyle: { color: 0xff3333 } });
    this.updateIndicator();

    this.progressBar = this.add.graphics({ fillStyle: { color: 0xffffff } });
    this.progressBar.setAlpha(0.7);

    this.createControls();

    this.phaseMessage = this.add.text(this.screenWidth / 2, 30, "", {
      font: "14px Arial",
      fill: "white",
      backgroundColor: "#5511ff",
      width: 200,
      alpha: 0.8,
      padding: 10,
    });
    this.phaseMessage.setOrigin(0.5, 0).setDepth(1000).setWordWrapWidth(300);

    this.phaseMessageEnd = this.add
      .text(this.screenWidth / 2, 100, "Touche espace pour continuer", {
        font: "12px Arial",
        fill: "black",
        width: 200,
      })
      .setOrigin(0.5, 0.5);

    this.resultMessage = this.add.text(0, 30, "", {
      font: "14px Arial",
      fill: "black",
    });

    this.infoAndScore = this.add
      .text(this.screenWidth / 2, 10, "", {
        font: "14px Arial",
        fill: "black",
        width: 200,
      })
      .setOrigin(0.5, 0);

    this.previewPhase();

    this.input.on("pointerdown", (pointer) => {
      console.log(pointer.worldX, pointer.worldY);
    });
  }

  update() {
    if (this.showingResult || this.waitingForPhaseStarting) {
      return;
    }

    if (3 == this.phase) {
      this.updatePhase3();
      return;
    }

    if (2 == this.phase) {
      this.updatePhase2();
      return;
    }

    if (1 == this.phase) {
      this.updatePhase1();
      return;
    }
  }

  previewPhase() {
    this.miner.anims.stop();
    this.showingResult = false;
    this.indicator.clear();
    this.resultMessage.setText("");
    this.progressBar.clear();
    this.waitingForPhaseStarting = true;
    this.infoAndScore.setVisible(false);
    this.phaseMessage.setVisible(true);
    this.phaseMessageEnd.setVisible(true);
    this.phaseMessage.setText(PreviewMessage[this.phase]);
  }

  endPreviewPhase() {
    this.phaseMessage.setVisible(false);
    this.phaseMessageEnd.setVisible(false);
  }

  startPhase1() {
    this.infoAndScore.setVisible(true);
    this.infoAndScore.setText(PreviewMessage[this.phase]);
    this.updateIndicator();

    this.playMiner();
    this.updateMiner();
  }

  updatePhase1() {
    if ((this.screenWidth * this.progressBarValue) / 100 >= this.screenWidth) {
      this.direction = -this.currentStep;
    }

    if (0 >= this.progressBarValue) {
      this.direction = this.currentStep;
    }

    this.progressBarValue = this.progressBarValue + this.direction;
    this.updateProgressBar();
  }

  updateProgressBar() {
    this.progressBar.clear();
    this.progressBar.fillStyle(0x000000, 1);
    this.progressBar.fillRect(
      0,
      60,
      (this.screenWidth * this.progressBarValue) / 100,
      30
    );
  }

  tryPhase1() {
    if (this.phase1EndScore == this.score || this.phase1MaxTry == this.try) {
      this.phase = 2;
      this.previewPhase();
      return;
    }

    this.try++;
    this.showingResult = false;
    this.progressBarValue = 0;
    this.direction = this.currentStep;
    this.resultMessage.setText("");
    this.indicatorPosition = Math.round(300 * Math.random()) + 100;
    this.indicator.setX(this.indicatorPosition);
    this.updateIndicator(false);
    this.playMiner();
    this.updateMiner();
  }

  startPhase2() {
    this.indicator.clear();
    this.progressBar.clear();
    this.resultMessage.setText(PreviewMessage[2]);
    this.resultMessage.setX(20);
    this.phase2press = false;
    this.phase2ShowingIndicator = false;
    this.phase2Timer = this.phase2TimerInit;
    this.phase2PreTimer = this.phase2PreTimerInit;
    this.indicatorPhaseWidth = this.indicatorPhaseWidthInit;
    this.endPhase2Timer = false;
    this.progressBarValue = 0;
    this.miner.anims.stop();
    this.showingResult = false;
  }

  updatePhase2() {
    if (this.phase2press) {
      this.progressBarValue++;
    } else if (this.progressBarValue > 0) {
      this.progressBarValue = this.progressBarValue - 2;
    }

    this.updateProgressBar();

    const progress = (this.screenWidth * this.progressBarValue) / 100;

    if (progress > this.screenWidth / 2 - 150) {
      this.runPhase2Timer();
    }

    if (!this.phase2ShowingIndicator) {
      return;
    }

    this.indicator.clear();
    this.indicator.fillStyle(0x33aa33, 0.7);

    if (this.endPhase2Timer == true) {
      this.indicatorPhaseWidth = this.indicatorPhaseWidth - 0.5;
    }

    this.indicator.fillEllipse(0, 75, this.indicatorPhaseWidth, 90);

    if (
      progress < (this.screenWidth - this.indicatorPhaseWidth) / 2 ||
      progress > (this.screenWidth + this.indicatorPhaseWidth) / 2
    ) {
      this.shake();
      this.resultMessage.setText("Raté !");
      this.resultMessage.setX(progress);

      this.showingResult = true;
      this.indicator.clear();
      this.indicator.fillStyle(0xff3333, 0.7);
      this.indicator.fillEllipse(0, 75, this.indicatorPhaseWidth, 90);

      setTimeout(() => {
        this.startPhase2();
      }, 1000);
    }
  }

  runPhase2Timer() {
    if (this.phase2ShowingIndicator == true) {
      return;
    }

    this.indicator.setX(this.screenWidth / 2);
    this.resultMessage.setText("Restez dans la zone verte !");
    this.resultMessage.setX(this.screenWidth / 2 - 80);
    this.phase2ShowingIndicator = true;

    setTimeout(() => {
      if (!this.phase2ShowingIndicator) {
        return;
      }

      this.loopPhase2Timer();
      this.endPhase2Timer = true;
    }, this.phase2PreTimer * 1000);
  }

  loopPhase2Timer() {
    if (this.showingResult) {
      return;
    }

    this.resultMessage.setText(`${this.phase2Timer}`);
    this.resultMessage.setX(this.screenWidth / 2 - 5);

    if (0 == this.phase2Timer) {
      this.showingResult = true;
      this.resultMessage.setText("Bravo !");
      setTimeout(() => {
        this.phase = 3;
        this.showingResult = false;
        this.previewPhase();
      }, 1000);
      return;
    }

    setTimeout(() => {
      if (!this.phase2ShowingIndicator) {
        return;
      }

      this.phase2Timer--;
      this.loopPhase2Timer();
    }, 1000);
  }

  startPhase3() {
    this.showingResult = false;
    this.infoAndScore.setVisible(true);
    this.infoAndScore.setText("Répétez les appuis sur la touche espace !");

    this.playMiner();

    this.timerMessage = this.add.text(
      this.screenWidth / 2 - 20,
      100,
      `${this.timer}`,
      {
        font: "34px Arial",
        fill: "black",
      }
    );

    setTimeout(() => {
      this.animPhase3();
    }, 200);

    setTimeout(() => {
      this.timerPhase3();
    }, 1000);
  }

  updatePhase3() {
    const position = (this.screenWidth * this.score) / 100;
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ff00, 1);
    this.progressBar.fillRect(0, 60, position, 30);
    this.resultMessage.setX(position - 5);
    this.resultMessage.setText(`${this.score}`);
  }

  animPhase3() {
    const delta = this.score - this.previousScore;
    this.miner.anims.msPerFrame = 150 / (1 + delta * 5);

    this.previousScore = this.score;

    if (0 < this.timer) {
      setTimeout(() => {
        this.animPhase3();
      }, 200);
      return;
    }
  }

  timerPhase3() {
    this.timer--;
    this.timerMessage.setText(`${this.timer}`);

    if (0 <= this.timer) {
      setTimeout(() => {
        this.timerPhase3();
      }, 1000);
      return;
    }

    this.shake();
    this.timerMessage.setText("Fin !");
    this.showingResult = true;
    this.miner.anims.play("miner-end");
  }

  updateMiner() {
    this.miner.anims.msPerFrame = 100 / (1 + (this.score / 5) * 1.1);
  }

  playMiner() {
    this.miner.anims.play("miner-digging", true);
  }

  updateIndicator(success) {
    this.indicator.clear();
    this.indicator.fillStyle(success ? 0x33aa33 : 0xff3333, 1);
    this.indicator.fillRect(0, 50, 50, 50);
    this.indicator.setX(this.indicatorPosition);
  }

  createControls() {
    this.cursors = this.input.keyboard.addKeys({
      space: "space",
    });

    this.input.keyboard.on(
      "keydown",
      (event) => {
        if (event.keyCode === 32) {
          this.handleAction();
        }
      },
      this
    );

    this.input.keyboard.on(
      "keyup",
      function (event) {
        this.stopAction();
      },
      this
    );
  }

  handleAction() {
    if (this.showingResult) {
      return;
    }

    if (this.waitingForPhaseStarting) {
      if (1 == this.phase) {
        this.startPhase1();
      }

      if (2 == this.phase) {
        this.startPhase2();
      }

      if (3 == this.phase) {
        this.startPhase3();
      }

      this.endPreviewPhase();
      this.waitingForPhaseStarting = false;
      return;
    }

    if (1 == this.phase) {
      this.handlePhase1();
      return;
    }

    if (2 == this.phase) {
      this.handlePhase2();
      return;
    }

    if (3 == this.phase) {
      this.handlePhase3();
      return;
    }
  }

  win() {
    this.resultMessage.setText("Parfait !");
    this.score++;
    this.infoAndScore.setText(
      this.score +
        " pts. " +
        (this.score < 4 ? "Plus vite !" : "Encore plus vite !!!")
    );
    this.currentStep = this.currentStep + 0.5;
    this.updateIndicator(true);

    this.miner.anims.stop();
    this.miner.anims.play("miner-digging");
    this.updateMiner();
    this.createDebris();
  }

  lose() {
    this.miner.anims.stop();
    this.shake();
    this.resultMessage.setText("Raté !");
  }

  createDebris() {
    Array(Phaser.Math.Between(4, 10))
      .fill(0)
      .forEach((i) => new RockDebris(this, 289, 236));
  }

  shake() {
    this.cameras.main.shake(300, 0.01);
  }

  handlePhase1() {
    const progress = (this.screenWidth * this.progressBarValue) / 100;
    this.resultMessage.setX(progress - 20);

    if (
      progress >= this.indicatorPosition &&
      progress <= this.indicatorPosition + 50
    ) {
      this.win();
    } else {
      this.lose();
    }

    this.showingResult = true;

    setTimeout(() => {
      this.tryPhase1();
    }, 1000);
  }

  handlePhase2() {
    this.phase2press = true;
    this.playMiner();
    this.createDebris();
  }

  handlePhase3() {
    this.score++;
    this.createDebris();
  }

  stopAction() {
    if (2 == this.phase) {
      this.phase2press = false;
      this.miner.anims.stop();
    }
  }
}
