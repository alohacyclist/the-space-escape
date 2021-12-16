const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

onload = function() {
    document.getElementById("start-btn").onclick = function() {
      startGame();
    }
}

function startGame() {
    updateCanvas();
}

canvas.width = innerWidth;
canvas.height = innerHeight;

const spaceshipImg = new Image();
spaceshipImg.src = './img/starwars.jpg'

// the spaceship object => the player
let spaceship = {
    img: spaceshipImg,
    x: canvas.width / 2,
    y: canvas.height / 2,
    w: 125,
    h: 165,
    speed: 5,
    draw: function () {
        ctx.drawImage(this.img, this.x, this.y, this.w,this.h);    
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

// obstacle objects class
class Object {
    constructor (x, y, w, h, speed) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.speed = 1
    }
    move() {
        this.y += this.speed
    }
    draw() {
        this.move();
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.w, this.h);
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
// update Counter
let updates = 0;

// random number function
function calcRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

let objectArray = []

// function to create new object after about 5 seconds
function createObjects () {
    updates++;
        
    if (updates % 200 === 0) {       
        console.log('new object')
        objectArray.push(new Object(calcRandomNum(0, canvas.width), 0, calcRandomNum(10, 60), calcRandomNum(10, 60)))
    }
}

// check for collision
function checkCollision () {
    const collision = objectArray.some((object) => {
        return spaceship.collision(object);
    })
    if(collision) {
        console.log('collision')
    }
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    spaceship.draw();
    createObjects();
    objectArray.forEach((object) => {
        object.draw();
    })
    checkCollision();

    requestAnimationFrame(updateCanvas)
}

document.addEventListener('keydown', (event) => {
    if(event.keyCode === 39) {
    spaceship.x += spaceship.speed;
    } else if(event.keyCode === 37) {
    spaceship.x -= spaceship.speed;
    } else if(event.keyCode === 38) {
    spaceship.y -= spaceship.speed;
    } else if(event.keyCode === 40) {
    spaceship.y += spaceship.speed;
    }
});