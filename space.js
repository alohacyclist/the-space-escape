const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const body = document.querySelector("body");
const title = document.querySelector("#title");

const startBtn = document.querySelector(".startBtn");
const howToPlayBtn = document.querySelector(".howToPlayBtn");
const pickShipBtn = document.querySelector(".pickShipBtn");
const showHighScore = document.querySelector(".showHighScore");

const startAgainBtn = document.querySelector(".startAgainBtn");
const submitBtn = document.querySelector(".submit");

const playerName = document.querySelector(".playerName");
const gameScore = document.querySelector(".gameScore");
const highScoreList = document.querySelector(".highScoreList");
const gameOverHighScore = document.querySelector(".gameOverHighScore");
const highScoreEntry = document.querySelector(".highScoreEntry");

const win = document.querySelector("#winScreen");
const startPage = document.querySelector("#startScreen");
const pickShip = document.querySelector("#pickShip");
const howToPlay = document.querySelector("#howToPlay");
const highScores = document.querySelector("#highScores");

// canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// background
const backgroundImg = new Image();
backgroundImg.src = "./img/bgL3.png";

function scaleToFit(img) {
	// get the scale
	var scale = Math.max(canvas.width / img.width, canvas.height / img.height);
	return scale;
}
// spaceship images
const spaceship1 = new Image();
spaceship1.src = "./img/Battleplane.png";
const spaceship2 = new Image();
spaceship2.src = "./img/MK1K.png";
const spaceship3 = new Image();
spaceship3.src = "./img/skyBlanc.png";

// spaceship html elements
const ship1 = document.querySelector("#ship1");
const ship2 = document.querySelector("#ship2");
const ship3 = document.querySelector("#ship3");

// objects
const airplaneL = new Image();
airplaneL.src = "./img/satelliteL.png";
const airplaneR = new Image();
airplaneR.src = "./img/satelliteR.png";
const asteroid = new Image();
asteroid.src = "./img/met1.png";
const asteroid2 = new Image();
asteroid2.src = "./img/met2.png";
const asteroid3 = new Image();
asteroid3.src = "./img/met3.png";
// enemies
const ufoY = new Image();
ufoY.src = "./img/ufoYellow.png";
const endboss = new Image();
endboss.src = "./img/endboss.png";
// sounds
const spaceshipLaser = new Audio("./sounds/spaceLaser.wav");
const enemyLaser = new Audio("./sounds/enemyLaser.wav");
const hit = new Audio("./sounds/hit.wav");
/* const startSong = new Audio('./sounds/impMarSong.mp3'); */
const gameMusic1 = new Audio("./sounds/colossus1.mp3");
const gameMusic2 = new Audio("./sounds/colossus2.mp3");

function setActive(element, ...elementsToDeactivate) {
	element.classList.add("active");
	elementsToDeactivate.forEach((el) => el.classList.remove("active"));
}

startBtn.onclick = () => {
	startGame();
	setActive(null, howToPlay, pickShip, title, highScores);
};

howToPlayBtn.onclick = () => {
	setActive(howToPlay, pickShip, title, highScores);
};

pickShipBtn.onclick = () => {
	setActive(pickShip, highScores, howToPlay, title, highScoreList, highScores);
};

showHighScore.onclick = () => {
	setActive(highScoreList);
	setActive(highScores, howToPlay, pickShip, title, startScreen);
	createTop3(highScoreList, highscoreArr);
};

function handleDisplay() {
	const destination = this.event.target.classList.value;
	switch (destination) {
		case "pickShipBtn":
			this.event.target.parentNode.parentNode.classList.remove("active");
			setActive(startScreen);
			setActive(pickShip);
			// startScreen.classList.add("active");
			// pickShip.classList.add("active");
			break;
		case "startBtn":
			this.event.target.parentNode.parentNode.classList.remove("active");
			startGame();
			break;
		case "howToPlayBtn":
			this.event.target.parentNode.parentNode.classList.remove("active");
			setActive(startScreen);
			setActive(howToPlay);
			break;
	}
}
// some variables
let animationId;
let textAlpha = 1;
let scoreName = "";
let newLevel = false;
let winLevel = false;
let endbossHits = 0;
let updates = 0;
let level = 1;
let difficulty = 100;
let shield = 200;
let score = 0;
let efficiency = 0;
let hitTargets = 0;
let shotsFired = 0;
let objectArray = [];
let weaponArr = [];
let explosionArr = [];
let enemyArr = [];
let endbossArr = [];
const highscoreArr = JSON.parse(localStorage.getItem("highscores")) || [];
let spaceshipWeaponColor = "rgb(73, 253, 84)";
let enemyWeaponColor = "rgb(255, 20, 247)";

// display game statistics
function dispalyStats() {
	let gradient = ctx.createLinearGradient(30, 30, 200, 0);
	gradient.addColorStop(0, "rgb(207, 0, 15)");
	gradient.addColorStop(0.6, "rgb(255, 240, 0)");
	gradient.addColorStop(1, "rgb(0, 230, 64)");

	ctx.fillStyle = gradient;
	ctx.fillRect(10, 10, shield, 30);
	ctx.strokeStyle = "rgb(255, 255, 255)";
	ctx.strokeRect(10, 10, 200, 30);

	ctx.font = "30px Arial";
	ctx.fillStyle = "white";
	ctx.fillText("Shield", 20, 35);
	ctx.fillText(`Score: ${score}`, canvas.width / 2 - 40, 35);
	if (highscoreArr[0] != undefined) {
		ctx.fillText(
			`Highscore: ${highscoreArr[0].playerScore}`,
			canvas.width - 280,
			35
		);
		if (score > highscoreArr[0].playerScore) {
			highscoreArr[0].playerScore = score;
		}
	} else {
		ctx.fillText(`Highscore: ${score}`, canvas.width - 280, 35);
	}
	if (newLevel) {
		ctx.save();
		textAlpha -= 0.0075;
		(ctx.font = "60px Arial"),
			(ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`);
		ctx.fillText(
			`Level ${level}`,
			canvas.width / 2 - 100,
			canvas.height / 2 - 50
		);
		ctx.restore();
	}
}
// random number function for sizing objects
function calcRandomNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

// draw & move background
const background = {
	img: backgroundImg,
	y: 0,
	speed: 1.3,
	move: function () {
		this.y += this.speed;
		this.y %= canvas.height;
	},
	draw: function () {
		this.move();
		let factor = scaleToFit(this.img);
		this.speed < 0
			? ctx.drawImage(
					this.img,
					0,
					this.y + canvas.height,
					this.img.width * factor,
					this.img.height * factor
			  )
			: ctx.drawImage(
					this.img,
					0,
					this.y - canvas.height,
					this.img.width * factor,
					this.img.height * factor
			  );
	},
};

// the spaceship object => the player
let spaceship = {
	img: spaceship1,
	x: canvas.width / 2 - 70,
	y: canvas.height / 2 - 70,
	w: 140,
	h: 140,
	velocity: {
		x: 2.5,
		y: 2.5,
	},
	draw: function () {
		ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
	},
};

// pick your spaceship
// Define an array of spaceship options and corresponding elements
const spaceshipOptions = [
	{ img: spaceship1, element: document.getElementById("ship1") },
	{ img: spaceship2, element: document.getElementById("ship2") },
	{ img: spaceship3, element: document.getElementById("ship3") },
];

// Add click event listeners for each spaceship option
spaceshipOptions.forEach((option, index) => {
	option.element.addEventListener("click", () => {
		spaceshipOptions.forEach((opt, i) => {
			opt.element.classList.toggle("selected", i === index);
		});
		spaceship.img = option.img;
		startBtn.classList.toggle("disabled");
	});
});

// Obstacles
class Objects {
	constructor(x, y, w, h, velocity, type, img) {
		this.img = img;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.a = Math.random() * 360;
		this.velocity = velocity;
		this.type = type;
		this.pointsCounted = false;
	}
	score() {
		if (
			level <= 3 &&
			this.x + this.w > canvas.width &&
			this.pointsCounted == false
		) {
			this.pointsCounted = true;
			score += 100;
		} else if (
			level > 3 &&
			level < 6 &&
			this.y > canvas.height &&
			(this.type === "asteroid" ||
				this.type === "asteroid2" ||
				this.type === "asteroid3") &&
			this.pointsCounted == false
		) {
			this.pointsCounted = true;
			score += 100;
		} else if (
			this.type === "enemy" &&
			this.y > canvas.height &&
			this.pointsCounted == false
		) {
			this.pointsCounted = true;
			score += 100;
		}
	}

	move() {
		this.a++;
		if (this.type === "airplane") {
			this.x += this.velocity;
		} else if (this.type === "asteroid" || this.type === "enemy") {
			this.y += this.velocity;
		} else if (this.type === "asteroid2") {
			this.x += this.velocity;
		} else if (this.type === "asteroid3") {
			this.y -= this.velocity;
		} else if (this.type === "endboss") {
			this.y += this.velocity;
			if ((this.y = 150)) (this.x += this.velocity), (this.y = 150);
			if (this.x + this.w > canvas.width)
				(this.velocity = calcRandomNum(-1, -5)), (this.y = 150);
			if (this.x + this.w < 0)
				(this.velocity = calcRandomNum(1, 5)), (this.y = 150);
		}
	}

	shoot() {
		let angle = Math.atan2(
			spaceship.y + spaceship.h / 2 - (this.y + this.h / 2),
			spaceship.x + spaceship.w / 2 - (this.x + this.w / 2)
		);
		let speed = {
			x: Math.cos(angle) * 6,
			y: Math.sin(angle) * 6,
		};

		if (updates % calcRandomNum(35, 100) === 0 && level < 9) {
			const enemyWeapon = new Weapon(
				this.x + this.w / 2,
				this.y + this.h / 2,
				3,
				speed,
				enemyWeaponColor
			);
			enemyArr.push(enemyWeapon);
			enemyLaser.play();
		} else if (updates % calcRandomNum(25, 60) === 0 && level <= 10) {
			const enemyWeapon = new Weapon(
				this.x + this.w / 2,
				this.y + this.h / 2,
				3,
				speed,
				enemyWeaponColor
			);
			enemyArr.push(enemyWeapon);
			enemyLaser.play();
		}
	}

	draw() {
		this.move();
		if (
			this.type === "asteroid" ||
			this.type === "asteroid2" ||
			this.type === "asteroid3" ||
			this.type === "enemy"
		) {
			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate((this.a * Math.PI) / 360);
			ctx.drawImage(this.img, 0 - this.w / 2, 0 - this.h / 2, this.w, this.h);
			ctx.restore();
		} else {
			ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
		}
	}
}

class Weapon {
	constructor(x, y, r, velocity, color) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}

	move() {
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.alpha -= 0.008;
	}

	draw() {
		this.move();
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}

	drawEnemyWeapon() {
		this.move();
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.beginPath();
		ctx.arc(this.x, this.y, (this.r += 0.15), 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}
}

class Explosion {
	constructor(x, y, r, velocity) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.exAlpha = 1;
		this.color = ctx.createRadialGradient(
			this.x,
			this.y,
			0,
			this.x,
			this.y,
			300
		);
		this.color.addColorStop(0, `rgb(255, 255, 0`);
		this.color.addColorStop(0.4, `rgb(255, 140, 0`);
		this.color.addColorStop(0.7, `rgb(207, 0, 15`);
		this.velocity = velocity;
	}

	move() {
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.exAlpha -= 0.002;
	}

	draw() {
		this.move();
		ctx.save();
		ctx.globalAlpha = this.exAlpha;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.restore();
	}
}

// Level logic
function createObjects() {
	if (updates % difficulty === 0 && level == 1) {
		objectArray.push(
			new Objects(
				0 - 180,
				calcRandomNum(0, canvas.height),
				calcRandomNum(140, 100),
				calcRandomNum(60, 90),
				1,
				"airplane",
				airplaneL
			)
		);
	} else if (updates % difficulty === 0 && level == 2) {
		Math.random() < 0.5
			? objectArray.push(
					new Objects(
						0 - 180,
						calcRandomNum(0, canvas.height),
						calcRandomNum(140, 100),
						calcRandomNum(60, 90),
						1,
						"airplane",
						airplaneL
					)
			  )
			: objectArray.push(
					new Objects(
						canvas.width + 100,
						calcRandomNum(0, canvas.height),
						calcRandomNum(140, 100),
						calcRandomNum(60, 90),
						-1,
						"airplane",
						airplaneR
					)
			  );
	} else if (updates % difficulty === 0 && level == 3) {
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid",
				asteroid
			)
		);
	} else if (updates % difficulty === 0 && level == 4) {
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid",
				asteroid
			)
		);
	} else if (updates % difficulty === 0 && level == 5) {
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid",
				asteroid
			)
		);
	} else if (updates % difficulty === 0 && level == 6) {
		gameMusic1.pause();
		gameMusic2.play();
		// left
		objectArray.push(
			new Objects(
				0 - 180,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid2",
				asteroid2
			)
		);
		// right
		objectArray.push(
			new Objects(
				canvas.width + 100,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				-1,
				"asteroid2",
				asteroid2
			)
		);
	} else if (updates % difficulty === 0 && level == 7) {
		// top
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid",
				asteroid
			)
		);
		// left
		objectArray.push(
			new Objects(
				0 - 180,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid2",
				asteroid2
			)
		);
		// right
		objectArray.push(
			new Objects(
				canvas.width + 100,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				-1,
				"asteroid2",
				asteroid2
			)
		);
	} else if (updates % difficulty === 0 && level == 8) {
		// top
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid",
				asteroid
			)
		);
		// left
		objectArray.push(
			new Objects(
				0 - 180,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid2",
				asteroid2
			)
		);
		// right
		objectArray.push(
			new Objects(
				canvas.width + 100,
				calcRandomNum(0, canvas.height),
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				-1,
				"asteroid2",
				asteroid2
			)
		);
		// bottom
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				canvas.height + 100,
				calcRandomNum(100, 50),
				calcRandomNum(100, 50),
				1,
				"asteroid3",
				asteroid3
			)
		);
	} else if (updates % (difficulty + 50) === 0 && level == 9) {
		objectArray.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				65,
				65,
				1,
				"enemy",
				ufoY
			)
		);
	} else if (
		updates % difficulty === 0 &&
		level == 10 &&
		endbossArr.length < 1
	) {
		endbossArr.push(
			new Objects(
				calcRandomNum(0, canvas.width),
				0 - 100,
				150,
				65,
				1,
				"endboss",
				endboss
			)
		);
	}
}

// create new levels
function levels() {
	if (updates % 1300 == 0 && level <= 10) {
		level++;
		newLevel = true;
		difficulty -= 10;
		setTimeout(() => {
			newLevel = false;
			textAlpha = 1;
		}, 1500);
		if (shield < 200) shield += 20;
	}
	if (updates % 1300 == 0 && level == 11) {
		newLevel = false;
		objectArray = [];
		enemyArr = [];
	}
}

// gameover
function gameOver() {
	cancelAnimationFrame(animationId);
	canvas.classList.remove("active");
	endScreen.classList.add("active");
	highScoreEntry.classList.add("active");
	gameOverHighScore.classList.add("active");
	gameScore.innerHTML = `${score}`;
	playerName.addEventListener("input", () => {
		submitBtn.disabled = false;
	});
	startAgainBtn.onclick = () => {
		reset();
		start();
	};
}

// win
function winGame() {
	cancelAnimationFrame(animationId);
	win.classList.remove("active");
	canvas.classList.remove("active");
	endScreen.classList.add("active");
	highScoreEntry.classList.add("active");
	gameOverHighScore.classList.add("active");
	gameScore.innerHTML = `${score}`;

	playerName.addEventListener("input", () => {
		submitBtn.disabled = false;
	});
	startAgainBtn.onclick = () => {
		reset();
		start();
	};
}

// Highscore
function enterHighscore() {
	scoreName = playerName.value;
	efficiency = ((hitTargets / shotsFired) * 100).toFixed(1).toString();
	highscoreArr.push({
		name: scoreName,
		playerScore: score,
		efficiency: efficiency,
		hitTargets: hitTargets,
		shotsFired: shotsFired,
	});
	localStorage.setItem("highscores", JSON.stringify(highscoreArr));
	playerName.value = "";
}

function createHighscoreEntry(
	el,
	scoreName,
	score,
	efficiency,
	hitTargets,
	shotsFired
) {
	const playerHighScore = document.createElement("li");
	playerHighScore.innerHTML = `<span class="upperCase">${scoreName}</span><span class=""> ${score}</span>${
		efficiency !== undefined && !isNaN(efficiency)
			? `<span class="more"> ${efficiency} %<div class="tooltip"><p>Hits: ${hitTargets}</p><p>Shots: ${shotsFired}</p></div></span>`
			: ""
	}`;
	el.appendChild(playerHighScore);
}

function createTop3(el, highscoreArr) {
	el.innerHTML = "";
	highscoreArr.sort(
		(score1, score2) => score2.playerScore - score1.playerScore
	);
	for (let i = 0; i < 10; i++) {
		console.log(highscoreArr[i]);
		if (highscoreArr[i]) {
			createHighscoreEntry(
				el,
				highscoreArr[i].name,
				highscoreArr[i].playerScore,
				highscoreArr[i].efficiency,
				highscoreArr[i].hitTargets,
				highscoreArr[i].shotsFired
			);
		}
	}
}

submitBtn.onclick = () => {
	enterHighscore();
	createTop3(gameOverHighScore, highscoreArr);
	highScoreEntry.classList.remove("active");
	gameOverHighScore.classList.add("active");
};

// new game reset
function reset() {
	spaceship.x = canvas.width / 2 - spaceship.w / 2;
	spaceship.y = canvas.height / 2 - spaceship.h / 2;
	updates = 0;
	level = 1;
	difficulty = 100;
	shield = 200;
	score = 0;
	/*	
	level = 9;
	difficulty = 100;
	shield = 2000;
	score = 77770;
	*/
	objectArray = [];
	weaponArr = [];
	enemyArr = [];
	explosionArr = [];
	submitBtn.style.display = "inline";
}

// start a new game
function start() {
	pickShip.classList.remove("active");
	howToPlay.classList.remove("active");
	endScreen.classList.remove("active");
	startScreen.classList.remove("active");
	canvas.classList.add("active");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	updateCanvas();
	gameMusic1.play();
}
// start the game
function startGame() {
	reset();
	start();
}

// shooting on mouseclick
addEventListener("click", (event) => {
	shotsFired++;
	spaceshipLaser.play();
	const angle = Math.atan2(
		event.clientY - (spaceship.y + spaceship.h / 2),
		event.clientX - (spaceship.x + spaceship.w / 2)
	);
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5,
	};
	const weapon = new Weapon(
		spaceship.x + spaceship.w / 2,
		spaceship.y + spaceship.h / 2,
		3,
		velocity,
		spaceshipWeaponColor
	);
	weaponArr.push(weapon);
});

// removes weapons from array if they are out of screen bounds
function deleteItems() {
	weaponArr.forEach((weapon, index) => {
		if (
			weapon.alpha < 0.1 ||
			weapon.x > canvas.width ||
			weapon.x < 0 ||
			weapon.y > canvas.height ||
			weapon.y < 0
		)
			weaponArr.splice(index, 1);
	});
	enemyArr.forEach((weapon, index) => {
		if (weapon.alpha < 0.05) enemyArr.splice(index, 1);
	});
	explosionArr.forEach((explosion, index) => {
		if (
			explosion.exAlpha < 0.1 ||
			explosion.x > canvas.width ||
			explosion.x < 0 ||
			explosion.y > canvas.height ||
			explosion.y < 0
		)
			explosionArr.splice(index, 1);
	});
}

// detects circle-circle collisions
function hitCircles(x1, x2, y1, y2, r1, r2) {
	return Math.hypot(x1 - x2, y1 - y2) <= r1 + r2;
}

// update canvas
function updateCanvas() {
	updates++;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	levels();
	createObjects();
	deleteItems();

	background.draw();
	spaceship.draw();

	// randomly pick enemy to shoot at spaceship
	if (level > 9 && objectArray.length > 0) {
		objectArray[Math.floor(Math.random() * objectArray.length)].shoot();
	}

	// enemy weapon - spaceship collisions
	enemyArr.forEach((enemy, index) => {
		enemy.drawEnemyWeapon();
		if (
			hitCircles(
				spaceship.x + spaceship.w / 2,
				enemy.x,
				spaceship.y + spaceship.h / 2,
				enemy.y,
				18,
				18
			)
		) {
			for (let i = 0; i <= 10; i++) {
				explosionArr.push(
					new Explosion(enemy.x, enemy.y, 3, {
						x: Math.random() - 0.5,
						y: Math.random() - 0.5,
					})
				);
			}
			hit.play();
			enemyArr.splice(index, 1);
			shield -= 50;
			score -= 50;
		}
	});

	// weapon - weapon collisions
	weaponArr.forEach((weapon, weaponIndex) => {
		weapon.draw();
		enemyArr.forEach((enemyWeapon, index) => {
			if (
				hitCircles(enemyWeapon.x, weapon.x, enemyWeapon.y, weapon.y, 18, 18)
			) {
				for (let i = 0; i <= 10; i++) {
					explosionArr.push(
						new Explosion(enemyWeapon.x, enemyWeapon.y, 3, {
							x: Math.random() - 0.5,
							y: Math.random() - 0.5,
						})
					);
				}
				hit.play();
				score += 20;
				hitTargets++;
				enemyArr.splice(index, 1);
				weaponArr.splice(weaponIndex, 1);
			}
		});
	});

	endbossArr.forEach((boss) => {
		boss.draw();
		boss.shoot();
		weaponArr.forEach((weapon, weaponIndex) => {
			if (hitCircles(weapon.x, boss.x, weapon.y, boss.y, 15, boss.w / 2)) {
				endbossHits++;
				for (let i = 0; i <= 10; i++) {
					explosionArr.push(
						new Explosion(boss.x + boss.w / 2, boss.y + boss.h / 2, 3, {
							x: Math.random() - 0.5,
							y: Math.random() - 0.5,
						})
					);
				}
				weaponArr.splice(weaponIndex, 1);
			}
			enemyArr.forEach((enemyWeapon, index) => {
				if (
					hitCircles(enemyWeapon.x, weapon.x, enemyWeapon.y, weapon.y, 18, 18)
				) {
					for (let i = 0; i <= 10; i++) {
						explosionArr.push(
							new Explosion(enemyWeapon.x, enemyWeapon.y, 3, {
								x: Math.random() - 0.5,
								y: Math.random() - 0.5,
							})
						);
					}
					hit.play();
					enemyArr.splice(index, 1);
					weaponArr.splice(weaponIndex, 1);
				}
			});
			explosionArr.forEach((explosion) => {
				explosion.draw();
			});
		});

		if (endbossHits >= 10) {
			for (let i = 0; i <= 10; i++) {
				explosionArr.push(
					new Explosion(boss.x + boss.w / 2, boss.y + boss.h / 2, 3, {
						x: Math.random() - 0.5,
						y: Math.random() - 0.5,
					})
				);
			}
			objectArray = [];
			win.classList.add("active");
			setTimeout(() => {
				objectArray = [];
			}, 2500);
			setTimeout(() => {
				winGame(), (score += 3000);
			}, 3500);
		}
		explosionArr.forEach((explosion) => {
			explosion.draw();
		});
	});

	// object - spaceship collisions
	objectArray.forEach((object, objIndex) => {
		object.draw();

		if (
			hitCircles(
				spaceship.x + spaceship.w / 2,
				object.x,
				spaceship.y + spaceship.h / 2,
				object.y,
				58,
				object.w / 2
			)
		) {
			for (let i = 0; i <= 10; i++) {
				explosionArr.push(
					new Explosion(object.x + object.w / 2, object.y + object.h / 2, 3, {
						x: Math.random() - 0.5,
						y: Math.random() - 0.5,
					})
				);
			}
			hit.play();
			objectArray.splice(objIndex, 1);
			shield -= 30;
			score -= 300;
		}
		// object - weapon collisions
		weaponArr.forEach((weapon, weaponIndex) => {
			if (
				hitCircles(weapon.x, object.x, weapon.y, object.y, 10, object.w / 2) &&
				level > 2
			) {
				for (let i = 0; i <= 10; i++) {
					explosionArr.push(
						new Explosion(weapon.x, weapon.y, 3, {
							x: Math.random() - 0.5,
							y: Math.random() - 0.5,
						})
					);
				}
				hit.play();
				objectArray.splice(objIndex, 1);
				weaponArr.splice(weaponIndex, 1);
				score += 50;
				hitTargets++;
			} else if (
				hitCircles(weapon.x, object.x, weapon.y, object.y, 3, object.w / 2)
			) {
				for (let i = 0; i <= 10; i++) {
					explosionArr.push(
						new Explosion(weapon.x, weapon.y, 3, {
							x: Math.random() - 0.5,
							y: Math.random() - 0.5,
						})
					);
				}
				hit.play();
				objectArray.splice(objIndex, 1);
				weaponArr.splice(weaponIndex, 1);
				score -= 150;
			}
		});

		explosionArr.forEach((explosion) => {
			explosion.draw();
		});

		object.score();
	});

	dispalyStats();

	animationId = requestAnimationFrame(updateCanvas);
	// GAME OVER
	if (shield <= 0) {
		gameOver();
	}
}
// control spaceship movement
document.addEventListener("keydown", (event) => {
	switch (event.keyCode) {
		case 37: // LEFT
			spaceship.x = spaceship.x - spaceship.velocity.x;
			break;
		case 38: // UP
			spaceship.y = spaceship.y - spaceship.velocity.y;
			break;
		case 39: // RIGHT
			spaceship.x = spaceship.x + spaceship.velocity.x;
			break;
		case 40: // DOWN
			spaceship.y = spaceship.y + spaceship.velocity.y;
			break;
	}
});
