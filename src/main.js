import Phaser from 'phaser'

import Game from './Game'

const config = {
	type: Phaser.AUTO,
	parent: 'game',
	width: 550,
	height: 300,
	backgroundColor: '#fff8e3',
	physics: {
		default: 'arcade',
		arcade: {
			//debug: true,
			gravity: { y: 0 },
		},
	},
	scene: [Game],
	scale: {
		zoom: 2,
		mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
	}
}

export default new Phaser.Game(config)
