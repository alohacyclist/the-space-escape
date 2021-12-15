const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// the spaceship object
let spaceship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    w: 100,
    h: 100,
    draw: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'red';
        ctx.fillRect(spaceship.x, spaceship.y, spaceship.w, spaceship.h);
        
    },
    move: function () {
        spaceship.draw();
        document.addEventListener('keydown', (event) => {
            if(event.keyCode === 39) {
            spaceship.x += 3;
            } else if(event.keyCode === 37) {
            spaceship.x -= 3;
            } else if(event.keyCode === 38) {
            spaceship.y -= 3;
            } else if(event.keyCode === 40) {
            spaceship.y += 3;
            }
        requestAnimationFrame(spaceship.draw)
        })
    }
}

class Asteroid {
    constructor (x, y, w, h, velocity) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.velocity = velocity;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    
    }
}

const asteroid = new Asteroid();

onload = function() {
    document.getElementById("start-btn").onclick = function() {
      startGame();
    }
}

function startGame() {
    updateCanvas();
}

function updateCanvas() {
    
    spaceship.move();
    asteroid.draw();

      
}


