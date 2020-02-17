
let game = null;
let W = 600;
let H = 800;
let BULLET_SPEED = 80;

let scenes = [];
let gameConfig = {
    type : Phaser.AUTO,
    width : W,
    height : H,
    scene : scenes,
    title : "bullet",
    pixelArt : true
};

class BootScene extends Phaser.Scene {
    constructor() {
        super("boot");
    }
    preload() {
        console.log("boot preload");
    }
    create() {
        this.scene.start("game");
    }
}

class BadGuy {
    constructor(x,y,scene) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x,y,"badguy");
        this.speed = 100;
    }
    update(ts,dt) {
        this.sprite.x += (this.speed * dt/1000.0);
        if (this.sprite.x>W) {
            this.sprite.x = 0;
        }
    }
}

class Player {
    constructor(x,y,scene) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x,y,"player");
        this.speed = 90;

        // move flags
        this.moving = false;
        this.moveleft = false;
        this.moveright = false;
        this.moveup = false;
        this.movedown = false;

        this.fire_rate = 0.5;
        this.fire_delta = 0;
    }
    chkptr(ptr) {
        this.resetflags();
        if (ptr.x>this.sprite.x) {
            this.moveright = true;
        } else if (ptr.x<this.sprite.x) {
            this.moveleft = true;
        }
        if (ptr.y<this.sprite.y) {
            this.moveup = true;
        }
        if (ptr.y>this.sprite.y) {
            this.movedown = true;
        }
    }
    pointerdown(ptr) {
        this.moving = true;
        this.chkptr(ptr);
    }
    pointerup() {
        this.moving = false;
        this.resetflags();
    }
    pointermove(ptr) {
        if (this.moving) {
            this.chkptr(ptr);
        }
    }
    resetflags() {
        this.moveleft = false;
        this.moveright = false;
        this.movedown = false;
        this.moveup = false;
    }
    update(ts,dt) {
        if (this.moving) {
            if (this.moveleft) {
                this.sprite.x -= (dt/1000*this.speed);
            }
            if (this.moveright) {
                this.sprite.x += (dt/1000* this.speed);
            }
            if (this.movedown) {
                this.sprite.y += (dt/1000*this.speed);
            }
            if (this.moveup) {
                this.sprite.y -= (dt/1000*this.speed);
            }    
        } else {
            // firing!!!
            this.fire_delta += (dt/1000);
            if (this.fire_delta>this.fire_rate) {
                let bg = this.scene.get_nearest_badguy();
                let angle = Math.atan2(bg.y - this.sprite.y, bg.x - this.sprite.x);
                let dx = BULLET_SPEED*Math.cos(angle);
                let dy = BULLET_SPEED*Math.sin(angle);
                this.scene.bullets.push(
                    new Bullet(this.sprite.x,this.sprite.y,dx,dy,this.scene));
                this.fire_delta = 0;
            }
        }
    }
}

class Bullet {
    constructor(x,y,dx,dy,scene) {
        this.dx = dx;
        this.dy = dy;
        this.scene = scene;
        this.sprite = scene.add.sprite(x,y,"bullet");
        this.speed = BULLET_SPEED;
        this.alive = true;
        this.count = 0;
    }
    update(ts,dt) {
        this.count++;
        if (this.count>64) {
            this.alive = false;
        }
        if (this.alive) {
            this.sprite.x += (this.dx * dt/1000);
            this.sprite.y += (this.dy * dt/1000);    
        }
    }
    remove() {
        this.sprite.destroy();
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
        this.badguy = null;
        this.player = null;
        this.bullets = [];
    }
    preload() {
        this.load.image("badguy", "CadetBlue.png");
        this.load.image("player", "IndianRed.png");
        this.load.image("bullet", "AntiqueWhite.png");
    }
    get_nearest_badguy() {
        return this.badguy;
    }
    create() {
        this.badguy = new BadGuy(100,100,this);
        this.player = new Player(400,100,this);
        this.input.on("pointerdown", (ptr) => {
            this.player.pointerdown(ptr);
        });
        this.input.on("pointerup", (ptr) => {
            this.player.pointerup();
        });
        this.input.on("pointermove", (ptr) => {
            this.player.pointermove(ptr);
        });
    }
    update(timestep, dt) {
        // timestep always going up
        // dt is in ms
        this.player.update(timestep,dt);
        this.badguy.update(timestep,dt);
        for (let i=0;i<this.bullets.length;i++) {
            this.bullets[i].update(timestep,dt);
        }
        for (let i=0;i<this.bullets.length;i++) {
          if (this.bullets[i].alive==false) {
              this.bullets[i].remove();
              this.bullets.splice(i,1);
          }
        }
    }
}

function mainline() {
    scenes.push(BootScene);
    scenes.push(GameScene);
    game = new Phaser.Game(gameConfig);
    window.focus();
    //resize();
    game.scene.start("boot");
}

window.onload = mainline;