
let game = null;
let W = 600;
let H = 800;

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
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
        this.badguy = null;
        this.player = null;
    }
    preload() {
        this.load.image("badguy", "CadetBlue.png");
        this.load.image("player", "IndianRed.png");
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