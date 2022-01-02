const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.querySelector('.startBtn');
const startAgainBtn = document.querySelector('.startAgainBtn');
const playerName = document.querySelector('.playerName');
const submitBtn = document.querySelector('.submit');
const highScoreList = document.querySelector('.highScoreList');


onload = function() {
    startBtn.onclick = function() {
      startGame();
    }
}

// HELPER VARIABLES
let spaceshipCircle = false;
let objectCircle = false;

// some variables
let animationId;
let scoreName = '';
let updates = 0;
let level = 1;
let shield = 500;
let score = 0;
let objectArray = [];
const weaponArr = []; 
const highscoreArr = JSON.parse(localStorage.getItem('highscores')) || [];

// display game statistics
function dispalyStats() {
  ctx.font = '25px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText(`Level: ${level}`, 30, 30);
  ctx.fillText(`Score: ${score}`, 30, 60);
  ctx.fillText(`Shield: ${shield}`, 30, 90);
}

canvas.width = 1024;
canvas.height = 1024;

const level3bg = new Image();
level3bg.src = './img/bgL3.png'

const spaceshipImg = new Image();
spaceshipImg.src = './img/spaceship.png';

const asteroid = new Image();
asteroid.src = './img/met1.png';

const airplaneL = new Image();
airplaneL.src = './img/airplaneL.png';

const airplaneR = new Image();
airplaneR.src = './img/airplaneR.png';


// moving background
const bgLevel3 = {
  img: level3bg,
  y: 0,
  speed: 1.3,
  move: function () {
    this.y += this.speed;
    this.y %= canvas.height;
  },
  draw: function () {
    this.move();
    ctx.drawImage(this.img, 0, this.y);
    this.speed < 0 ? ctx.drawImage(this.img, 0, this.y + canvas.height) : ctx.drawImage(this.img, 0, this.y - canvas.height);
  }
}

// the spaceship object => the player
let spaceship = {
    img: spaceshipImg,
    x: canvas.width / 2,
    y: canvas.height / 2,
    w: 100,
    h: 100,
    // angle
    a: 0,  
    thrust: 2.5,
    isThrusting: false,
    velocity: {
      x: 0,
      y: 0
    },
    draw: function () {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
}

// LEVEL 1 Obstacles
class Objects {
  constructor (x, y, w, h, velocity, type, img) {
      this.img = img;
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.a = Math.random() * 360;
      this.rotation = Math.random() < 0.5 ? -1 : 1;
      this.velocity = velocity;
      this.type = type;
      this.collisionCounted = false;
      this.pointsCounted = false;
  }
  score() {
    if(level <= 3 && (this.x + this.w > canvas.width) && this.pointsCounted == false) {
      this.pointsCounted = true;
      score += 100;
    } else if (this.type === 'asteroid' && this.y > canvas.height && this.pointsCounted == false) {
      this.pointsCounted = true;
      score += 100;
    }
  }
  move() {
    this.a++;
    if (this.type === 'airplane' || this.type === 'satellite' || this.type === 'bird' || this.type === 'balloon') {
      this.x += this.velocity;
    } else if (this.type === 'asteroid' && level > 2 && level < 6 ) {
      this.y += this.velocity;
    } else if (this.type === 'asteroid' && level >= 6) {
      this.x += this.velocity;
    }
  }
  draw() {
      this.move();
      if(this.type === 'asteroid'){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.a * Math.PI/360);
        ctx.drawImage(this.img, 0 - this.w/2, 0 - this.h/2, this.w, this.h);
        ctx.restore();
      } else {
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
      }
  }
}

// random number function for sizing objects
function calcRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

//helper function -> create 3 objects
const object1 = new Objects (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL)
const object2 = new Objects (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL)
const object3 = new Objects (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL)

// create objects from left
function createObjects() {
  if (updates % 100 === 0 && level == 1) {   
    objectArray.push(new Objects
      (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL));
  } else if (updates % 80 === 0 && level == 2) {
    Math.random() < 0.5 ? objectArray.push(new Objects
      (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL)) :
      objectArray.push(new Objects
        (canvas.width + 100, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), -1, 'airplane', airplaneR)); 
  } else if (updates % 80 === 0 && level == 3 ) {
    objectArray.push(new Objects
      (calcRandomNum(0, canvas.width), 0 - 100, calcRandomNum(100, 50), calcRandomNum(100, 50), 1, 'asteroid', asteroid));
  } else if (updates % 60 === 0 && level == 4) {
    objectArray.push(new Objects
      (calcRandomNum(0, canvas.width), 0 - 100, calcRandomNum(100, 50), calcRandomNum(100, 50), 1, 'asteroid', asteroid));
  } else if (updates % 40 === 0 && level == 5) {
    objectArray.push(new Objects
      (calcRandomNum(0, canvas.width), 0 - 100, calcRandomNum(100, 50), calcRandomNum(100, 50), 1, 'asteroid', asteroid));
  } else if (updates % 80 === 0 && level >= 6) {
    // left
    objectArray.push(new Objects
      (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(100, 50), calcRandomNum(100, 50), 1, 'asteroid', asteroid));
    // right
    objectArray.push(new Objects
      (canvas.width + 100, calcRandomNum(0, canvas.height), calcRandomNum(100, 50), calcRandomNum(100, 50), -1, 'asteroid', asteroid))
  }
}

// Levels
function levels() {
  if(updates % 1500 == 0) {
    level++;
    if (shield < 500) {
      shield += 50;
    }
  } 
} 

// Highscore
function enterHighscore() {
  scoreName = playerName.value;
  highscoreArr.push({name: scoreName, playerScore: score});
  localStorage.setItem('highscores', JSON.stringify(highscoreArr));
  playerName.value = '';   
}

function createHighscoreEntry (scoreName, score) {
  const playerHighScore = document.createElement('li');
  playerHighScore.innerHTML = `${scoreName} ${score}`;
  highScoreList.appendChild(playerHighScore);
}

function createTop3 (highscoreArr) {
  highScoreList.innerHTML = '';
  highscoreArr.sort((score1, score2) => score2.playerScore - score1.playerScore);
  for (let i = 0; i < 3; i++) {
    if (highscoreArr[i]) {
      createHighscoreEntry(highscoreArr[i].name, highscoreArr[i].playerScore)
    }
  }
}

submitBtn.onclick = () => {
  enterHighscore();
  createTop3(highscoreArr);
  submitBtn.style.display = 'none';
}

// new Game reset
function reset() {
  spaceship.x = canvas.width/2;
  spaceship.y = canvas.height/2;
  updates = 0;
  level = 1;
  shield = 500;
  score = 0;
  objectArray = [];
  submitBtn.style.display = 'inline'
}

function start() {
  endScreen.style.display = 'none';
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  updateCanvas();
}

function gameOver() {
  cancelAnimationFrame(animationId);
  canvas.style.display = 'none';
  endScreen.style.display = 'flex';
  startAgainBtn.onclick = function() {
    reset();
    start();
    }
}

function startGame() {
  start();
}

class Weapon {
  constructor(x, y, r, color, velocity) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
    this.velocity = velocity;
  }

  move() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }

  draw() {
    this.move();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - (spaceship.y + spaceship.h/2), event.clientX - (spaceship.x + spaceship.w/2));
  const velocity = {
    x: Math.cos(angle) * 4,
    y: Math.sin(angle) * 4
  };
  const weapon = new Weapon(spaceship.x + spaceship.w/2, spaceship.y + spaceship.h/2, 5, 'red', velocity);
  weaponArr.push(weapon);
})

// removes weapons from array if they are out of screen bounds
function deleteWeapon() {
  weaponArr.forEach((weapon, wIdx) => {
    if(weapon.x > canvas.width || weapon.x < 0 || weapon.y > canvas.height || weapon.y < 0) weaponArr.splice(wIdx, 1);
  })
}
// detects circle-circle collisions
function hitCircles(x1, x2, y1, y2, r1, r2) {
  return (Math.hypot(x1 - x2, y1 - y2) <= r1 + r2);
}

function createExplosion(x, y) {
   ctx.fillStyle = 'darkred';
   ctx.strokeStyle = 'darkred';
   ctx.beginPath();
   ctx.arc(x, y, 25, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = 'red';
   ctx.strokeStyle = 'red';
   ctx.beginPath();
   ctx.arc(x, y, 20, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = 'orange';
   ctx.strokeStyle = 'orange';
   ctx.beginPath();
   ctx.arc(x, y, 15, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = 'yellow';
   ctx.strokeStyle = 'yellow';
   ctx.beginPath();
   ctx.arc(x, y, 10, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = 'white';
   ctx.strokeStyle = 'white';
   ctx.beginPath();
   ctx.arc(x, y, 5, 0, Math.PI * 2, false);
   ctx.fill();
   ctx.stroke();
}
  
function updateCanvas() {
    updates++;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    levels();
    createObjects();
    deleteWeapon();

    bgLevel3.draw();
    spaceship.draw();
// DELETE LATER
  if(spaceshipCircle) {
    ctx.strokeStyle = 'salmon';
    ctx.beginPath();
    ctx.arc(spaceship.x + spaceship.w/2, spaceship.y + spaceship.h/2, 60, 0, Math.PI * 2, false);
    ctx.stroke();
  }
  // airplane
  if(objectCircle && level < 3) {
    objectArray.forEach((object) => {
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(object.x + object.w/2, object.y + object.h/2, 40, 0, Math.PI * 2, false);
    ctx.stroke();
    })
  // asteroid
  } else if(objectCircle) {
    objectArray.forEach((object) => {
      ctx.strokeStyle = 'lime';
      ctx.beginPath();
      ctx.arc(object.x, object.y, 35, 0, Math.PI * 2, false);
      ctx.stroke();
    })
  }
    dispalyStats();
    weaponArr.forEach((weapon) => {
      weapon.draw();
    })
    objectArray.forEach((object, objIndex) => {
      object.draw();
      if(hitCircles(spaceship.x + spaceship.w/2, object.x + object.w/2, spaceship.y + spaceship.h/2, object.y + object.h/2, 60, object.w/2)) {
        objectArray.splice(objIndex, 1);
        shield -= 150;
        score -= 300;
      }   
      weaponArr.forEach((weapon, weaponIndex) => {        
        if (hitCircles(weapon.x, object.x + object.w/2, weapon.y, object.y + object.h/2, 3, object.w/2) && level > 2) {
        createExplosion(weapon.x, weapon.y);
        objectArray.splice(objIndex, 1);
        weaponArr.splice(weaponIndex, 1);
        score += 50;
        } else if (hitCircles(weapon.x, object.x + object.w/2, weapon.y, object.y + object.h/2, 3, object.w/2)) {
          createExplosion(weapon.x, weapon.y);
          objectArray.splice(objIndex, 1);
          weaponArr.splice(weaponIndex, 1);
          score -= 150;
          }
      })
      object.score();
    })

    animationId = requestAnimationFrame(updateCanvas)
    // GAME OVER
    if(shield <= 0) {
      gameOver();
    }
}

/* document.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
    case 37:
      spaceship.x -= 0;
      break;
    case 38:
      spaceship.y -= 0;
      break;
    case 39:
      spaceship.x += 0;
      break;
    case 40:
      spaceship.y += 0;
      break;
  }
}); */

document.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 37: // LEFT
      spaceship.velocity.x += spaceship.thrust;
      spaceship.x -= spaceship.velocity.x / 15;
      break;
    case 38: // UP
      spaceship.velocity.y += spaceship.thrust;
      spaceship.y -= spaceship.velocity.y / 15;
      break;
    case 39: // RIGHT
      spaceship.velocity.x += spaceship.thrust;
      spaceship.x += spaceship.velocity.x / 15;
      break;
    case 40:
      spaceship.velocity.y += spaceship.thrust;
      spaceship.y += spaceship.velocity.y / 15;
      break;
  }
});


