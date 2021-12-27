const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const startBtn = document.querySelector('.startBtn');

onload = function() {
    document.querySelector('.startBtn').onclick = function() {
      startGame();
    }
}

function startGame() {
    endScreen.style.display = 'none';
    startScreen.style.display = 'none';
    highScore.style.display = 'none';
    canvas.style.display = 'block';
    updateCanvas();
}

// some variables
let animationId;
let updates = 0;
let level = 1;
let shield = 500;
let score = 0;

let objectArray = [];

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
    },
    left: function () {
        return this.x;
      },
    right: function () {
        return this.x + this.w;
      },
    top: function () {
        return this.y;
      },
    bottom: function () {
        return this.y + this.h;
      },
    collision: function (object) {
        return !(
          this.bottom() < object.top() ||
          this.top() > object.bottom() ||
          this.right() < object.left() ||
          this.left() > object.right()
        );
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
      this.x += this.velocity
    } else if (this.type === 'asteroid') {
      this.y += this.velocity
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
  left() {
      return this.x;
    }
  right() {
      return this.x + this.w;
    }
  top() {
      return this.y;
    }
  bottom() {
      return this.y + this.h;
    }
}

// random number function for sizing objects
function calcRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

// create objects from left
function createObjects() {
  if (updates % 120 === 0 && level == 1) {   
    objectArray.push(new Objects
      (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL));
  } else if (updates % 100 === 0 && level == 2) {
    Math.random() < 0.5 ? objectArray.push(new Objects
      (0 - 180, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), 1, 'airplane', airplaneL)) :
      objectArray.push(new Objects
        (canvas.width + 100, calcRandomNum(0, canvas.height), calcRandomNum(180, 100), calcRandomNum(30, 50), -1, 'airplane', airplaneR)); 
  } else if (updates % 100 === 0 && level >= 3) {
    objectArray.push(new Objects
      (calcRandomNum(0, canvas.width), 0 - 100, calcRandomNum(100, 50), calcRandomNum(100, 50), 1, 'asteroid', asteroid));
  }
}

// check for collision
function checkCollision() {
    objectArray.some((object) => {
      if(spaceship.collision(object)) {
        let index = objectArray.indexOf(object)
        objectArray.splice(index, 1)
        shield -= 150;
        score -= 300;
      }
  })
}

// Levels
function levels() {
  if(updates % 1500 == 0) {
    level++, shield += 100;
  }    
}
  
function updateCanvas() {
    updates++;
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    levels();
    checkCollision();
    createObjects();
    
    bgLevel3.draw();
    spaceship.draw();
    dispalyStats();
    
    objectArray.forEach((object) => {
        object.draw();
        object.score();
    })

    // GAME OVER
    if(shield <= 0) {
      gameOver();
    }

    requestAnimationFrame(updateCanvas)
}

function gameOver() {
  canvas.style.display = 'none';
  endScreen.style.display = 'block';
  highScore.style.display = 'block';
  document.querySelector('.startAgainBtn').onclick = function() {
    startGame();
  }
}

document.addEventListener('keyup', (event) => {
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
});

document.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 37: // LEFT

      spaceship.velocity.x += spaceship.thrust;
      spaceship.x -= spaceship.velocity.x / 10;
      break;
    case 38: // UP
      spaceship.velocity.y += spaceship.thrust;
      spaceship.y -= spaceship.velocity.y / 10;
      break;
    case 39: // RIGHT
      spaceship.velocity.x += spaceship.thrust;
      spaceship.x += spaceship.velocity.x / 10;
      break;
    case 40:
      spaceship.velocity.y += spaceship.thrust;
      spaceship.y += spaceship.velocity.y / 10;
      break;
  }
});
