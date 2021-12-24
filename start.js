const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");


let stars = [];

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.speed = 2;
        this.direction = 1;
    }
    update() {
        this.speed += 0.01;
        this.x += this.speed;
        this.y += this.speed;
    }
    draw() {
        
        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }
}

