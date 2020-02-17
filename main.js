
let game = null;
let W = 600;
let H = 800;
let BULLET_SPEED = 200;
let BADGUYCOUNT=10;
let PLAYER_FIRE_RATE = 0.3;

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

class BadGuySprite extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y,key) {
        super(scene,x,y,key);
        scene.add.existing(this);
        this.speed = 80;
    }
    bounds() {
        if (this.x>W) {
            this.x = 0;
        }
        if (this.x<0) {
            this.x = W;
        }
        if (this.y>H) {
            this.y = 0;
        }
        if (this.y<0) {
            this.y = H;
        }
    }
    update(ts,dt) {
        this.x += (this.speed * dt/1000);
        this.bounds();
    }
}

class SimpleBadGuy extends BadGuySprite {
    constructor(scene,x,y,key,dx,dy) {
        super(scene,x,y,key);
        this.dx = dx;
        this.dy = dy;
    }
    update(ts,dt) {
        dt = dt/1000;
        this.x += (this.dx * dt);
        this.y += (this.dy * dt);
        this.bounds();
    }
}

class PlayerSprite extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y,key) {
        super(scene,x,y,key);
        scene.add.existing(this);
        console.log(this);

        // my stuff
        this.speed = 90;

        // move flags
        this.moving = false;
        this.moveleft = false;
        this.moveright = false;
        this.moveup = false;
        this.movedown = false;

        this.fire_rate = PLAYER_FIRE_RATE;
        this.fire_delta = 0;
    }
    chkptr(ptr) {
        this.resetflags();
        if (ptr.x>this.x) {
            this.moveright = true;
        } else if (ptr.x<this.x) {
            this.moveleft = true;
        }
        if (ptr.y<this.y) {
            this.moveup = true;
        }
        if (ptr.y>this.y) {
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
        dt=dt/1000.0;
        if (this.moving) {
            if (this.moveleft) {
                this.x -= (dt*this.speed);
            }
            if (this.moveright) {
                this.x += (dt* this.speed);
            }
            if (this.movedown) {
                this.y += (dt*this.speed);
            }
            if (this.moveup) {
                this.y -= (dt*this.speed);
            }    
        } else {
            // firing!!!
            this.fire_delta += (dt);
            if (this.fire_delta>this.fire_rate) {
                //console.log("bullet now");
                let bg = this.scene.get_nearest_badguy(this.x,this.y);
                //console.log(this.scene.get_nearest_badguy());
                let angle = Math.atan2(bg.y - this.y, 
                    bg.x - this.x);
                //console.log("angle",angle)
                let dx = BULLET_SPEED*Math.cos(angle);
                let dy = BULLET_SPEED*Math.sin(angle);
                //console.log(this.sprite.x,this.sprite.y,
                //    dx,dy);
                this.scene.bullet_group.add(
                    new BulletSprite(this.scene,this.x,this.y,"bullet",
                    dx,dy));
                this.fire_delta = 0;
            }
        }
    }

}

class BulletSprite extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y,key,dx,dy) {
        super(scene,x,y,key);
        scene.add.existing(this);
        this.dx = dx;
        this.dy = dy;
        this.speed = BULLET_SPEED;
        this.count = 0;
    }
    update(ts,dt) {
        dt=dt/1000.0;
        this.count++;
        if (this.count>64) {
            this.setActive(false);
            this.scene.bullet_group.killAndHide(this);
        }
        if (this.active) {
            this.x += (this.dx * dt);
            this.y += (this.dy * dt);    
        }
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
        this.bullet_group = null;
        this.badguy_group = null;
    }
    preload() {
        this.load.image("badguy", "CadetBlue.png");
        this.load.image("player", "IndianRed.png");
        this.load.image("bullet", "AntiqueWhite.png");
    }
    get_nearest_badguy(x,y) {
        // not working
        let a = this.badguy_group.getChildren();
        let index = -1;
        let m = 1000000;
        for (let i=0;i<a.length;i++) {
            let dude = a[i];
            let tmp1 = dude.x-x;
            let tmp2 = dude.y-y;
            // took out the sqrt
            //let dist = Math.sqrt((tmp1*tmp1)+(tmp2*tmp2));
            let dist = ((tmp1*tmp1)+(tmp2*tmp2));
            if (dist<m) {
                m = dist;
                index = i;
            }
        }
        // TODO: need to check for no bad guys
        if (index!=-1) {
            return a[index];
        }
        return a[0];
    }
    create() {
        this.player_group = this.add.group();
        this.player_group.runChildUpdate = true;

        this.bullet_group = this.add.group();
        this.bullet_group.runChildUpdate = true;

        this.badguy_group = this.add.group();
        this.badguy_group.runChildUpdate = true;

        for (let i=0;i<BADGUYCOUNT;i++) {
            let dx = Phaser.Math.Between(-150,150);
            let dy = Phaser.Math.Between(-150,150);
            let x = Phaser.Math.Between(0,W);
            let y = Phaser.Math.Between(0,H);
            this.badguy_group.add(
                new SimpleBadGuy(this,x,y,"badguy",dx,dy))
        }
        //this.badguy = new BadGuySprite(this,100,100,"badguy")
        //this.badguy_group.add(new BadGuySprite(this,100,100,"badguy"));
        //this.badguy_group.add(new BadGuySprite(this,100,400,"badguy"));

        let player = new PlayerSprite(this,400,150,"player");
        this.player_group.add(player);
        this.input.on("pointerdown", (ptr) => {
            player.pointerdown(ptr);
        });
        this.input.on("pointerup", (ptr) => {
            player.pointerup();
        });
        this.input.on("pointermove", (ptr) => {
            player.pointermove(ptr);
        });
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