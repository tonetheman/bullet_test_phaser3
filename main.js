
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
    init() {
        let e = document.createElement("style");
        document.head.appendChild(e);
        let sheet = e.sheet;
        let styles = "@font-face {font-family: \"cent\"; src : url('fonts/Centurion Bold 8x8.ttf')";
        sheet.insertRule(styles,0);
    }
    preload() {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }
    create() {
        //this.scene.start("game");
        let me = this;
        WebFont.load({
            custom: {
                families: [ "cent" ]
            },
            active: function ()
            {
                me.add.text(32, 32, 'just\nstand\nstill...', 
                    { fontFamily: 'cent', fontSize: 64, color: '#ff0000' })
                    .setShadow(2, 2, "#333333", 2, false, true);
                me.add.text(150, 350, 'tony\ncolston', 
                { fontFamily: 'cent', fontSize: 32, color: '#5656ee' });

                // delay in ms
                var timer = me.time.delayedCall(2000, ()=>{
                    me.scene.start("game");
                });  // delay in ms
            }
        });
    }
    update() {

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
                let bg = this.scene.get_nearest_badguy(this.x,this.y);
                let angle = Math.atan2(bg.y - this.y, 
                    bg.x - this.x);
                let dx = BULLET_SPEED*Math.cos(angle);
                let dy = BULLET_SPEED*Math.sin(angle);
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
    check_for_collision() {
        let bads = this.scene.badguy_group.getChildren();
        //console.log(this.x,this.y);
        for (let i=0;i<bads.length;i++) {
            let b = bads[i];
            //console.log("\tbads[i]",b.x,b.y);
            if ((this.x>=b.x) && (this.x<=(b.x+16))) {
                // possible hit with x
                if ((this.y>=b.y) && (this.y<=b.y+16)) {
                    console.log("hit");
                    this.scene.badguy_group.killAndHide(b);
                }
            }
        }
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
        //this.check_for_collision();
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

        let player = new PlayerSprite(this,W/2,H/2,"player");
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
    resize();
    game.scene.start("boot");
}

window.onload = mainline;