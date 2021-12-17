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

// some variables
let updates = 0;
let level = 1;
let score = 0;
let lifes = 5;

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

// LEVEL 1 Obstacles
class EarthObjects {
  constructor (x, y, w, h, velocity) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.velocity = {
        x: 1,
        y: 0
      }
  }
  move() {
      this.x += this.velocity.x
  }
  draw() {
      this.move();
      ctx.fillStyle = 'blue';
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

// LEVEL 2 Obstacles
class OrbitObjects {
  constructor (x, y, w, h, velocity) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.velocity = {
        x: 1,
        y: 0
      }
  }
  move() {
      this.x += this.velocity.x
  }
  draw() {
      this.move();
      ctx.fillStyle = 'darkgrey';
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

// LEVEL 3 Obstacles
class Asteroid {
    constructor (x, y, w, velocity) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = this.w;
        this.velocity = {
          x: 0,
          y: 1
        }
    }
    move() {
        this.y += this.velocity.y
    }
    draw() {
        this.move();
        ctx.fillStyle = 'brown';
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

// random number function
function calcRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

let objectArray = [];

// create objects from left and right
function createObjects () {
  updates++;
  if (updates % 200 === 0) {   
      objectArray.push(new FlyingObjectsEarth(x, y, w, h));
  }
}


// function to create new asteroid after about 5 seconds
function createAsteroids1  () {
    updates++;
    if (updates % 200 === 0) {   
        objectArray.push(new Asteroid(calcRandomNum(0, canvas.width), 0, calcRandomNum(10, 60)))
    console.log(objectArray)
      }
}

// check for collision
function checkCollision () {
    const collision = objectArray.some((object) => {
        return spaceship.collision(object);
    })
    if(collision) {
        objectArray.splice(this.index, 1);
        
    }  
}

function updateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    spaceship.draw();
    checkCollision();
    createAsteroids1();
    
    objectArray.forEach((object) => {
        object.draw();
    })
    

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