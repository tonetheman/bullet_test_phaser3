
let game = null;
let W = 360;
let H = 640;
let BULLET_SPEED = 250;
let BADGUYCOUNT=50;
let PLAYER_FIRE_RATE = 0.5;

let scenes = [];
let gameConfig = {
    type : Phaser.AUTO,
    width : W,
    height : H,
    scene : scenes,
    title : "bullet",
    pixelArt : true
};

class EndLevelScene extends Phaser.Scene {
    constructor() {
        super("endlevel");
    }
    init(data) {
        console.log("there is an init?",data);
    }
    preload() {
        console.log("preload");
    }
    create() {
        console.log("create called");
        this.add.text(32, 32, 'fin', 
                    { fontFamily: 'cent', fontSize: 32, color: '#ff0000' })
                    .setShadow(2, 2, "#333333", 2, false, true);
    }
}

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
                me.add.text(32, 32, 'you cant\nshoot\nand run', 
                    { fontFamily: 'cent', fontSize: 32, color: '#ff0000' })
                    .setShadow(2, 2, "#333333", 2, false, true);
                me.add.text(150, 350, 'tony\ncolston', 
                { fontFamily: 'cent', fontSize: 24, color: '#5656ee' });

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

class PowerupSprite extends Phaser.GameObjects.Sprite {
    constructor(scene,x,y,key) {
        super(scene,x,y,key);
        scene.add.existing(this);
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
        //
        //this.originX = 0;
        //this.originY = 0;
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

        this.dx = 0;
        this.dy = 0;

        this.fire_rate = PLAYER_FIRE_RATE;
        this.fire_delta = 0;

        //
        this.base_health = 100;
    }
    compute_dx(ptr) {
        let angle = Math.atan2(ptr.y-this.y,ptr.x-this.x);
        this.dx = this.speed*Math.cos(angle);
        this.dy = this.speed*Math.sin(angle);
    }
    pointerdown(ptr) {
        this.moving = true;        
        this.compute_dx(ptr);
    }
    pointerup() {
        this.moving = false;
        this.resetflags();
    }
    pointermove(ptr) {
        if (this.moving) {
            this.compute_dx(ptr);
        }
    }
    resetflags() {
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
        dt=dt/1000.0;
        if (this.moving) {
            this.x += (dt*this.dx);
            this.y += (dt*this.dy);
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
        this.bounds();
    }

}

/*
    got idea for this from an answer here
    my game is box aligned so this should work
    https://gamedev.stackexchange.com/questions/586/what-is-the-fastest-way-to-work-out-2d-bounding-box-intersection
*/
function collision_check(a,b) {
    let res = (Math.abs(a.x-b.x) * 2 < (16+8)) &&
    (Math.abs(a.y-b.y) * 2< (16+8))
    return res;
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
        for (let i=0;i<bads.length;i++) {
            let b = bads[i];
            if (!b.active) continue;

            let res = collision_check(this,b);
            if (res) {
                this.scene.badguy_group.killAndHide(b);
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
        this.check_for_collision();
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("game");
        this.bullet_group = null;
        this.badguy_group = null;
        this.player = null; // need a reference for score
    }
    preload() {
        // by default phaser loads the x and y origin point to be in the middle
        this.load.image("badguy", "CadetBlue.png");
        this.load.image("player", "IndianRed.png");
        this.load.image("bullet", "AntiqueWhite.png");
        this.load.image("powerup", "GreenYellow.png");
        this.load.image("magenta", "magenta.png");
    }
    get_nearest_badguy(x,y) {
        let a = this.badguy_group.getChildren();
        let index = -1;
        let m = 1000000;
        for (let i=0;i<a.length;i++) {
            let dude = a[i];
            if (!dude.active) continue;
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
        // console.log(this);
        this.player_group = this.add.group();
        this.player_group.runChildUpdate = true;

        this.bullet_group = this.add.group();
        this.bullet_group.runChildUpdate = true;

        this.badguy_group = this.add.group();
        this.badguy_group.runChildUpdate = true;

        this.powerup_group = this.add.group();
        //this.powerup_group.runChildUpdate = true;
        
        this.powerup_group.add(
            new PowerupSprite(this,
                //Phaser.Math.Between(0,W),
                //Phaser.Math.Between(0,H),
                200,200,
                "powerup")
        );

        for (let i=0;i<BADGUYCOUNT;i++) {
            let dx = Phaser.Math.Between(-150,150);
            let dy = Phaser.Math.Between(-150,150);
            let x = Phaser.Math.Between(0,W);
            let y = Phaser.Math.Between(0,H);
            this.badguy_group.add(
                new SimpleBadGuy(this,x,y,"badguy",dx,dy))
        }


        let player = new PlayerSprite(this,W/2,H/2,"player");
        this.player = player;
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

        let tmp = new Phaser.GameObjects.Sprite(this,W/2+8,H/2+8,"magenta");
        tmp.originX = 0;
        tmp.originY = 0;
        this.add.existing(tmp);

        this.health = this.add.text(0,0,player.base_health);
    }
    update() {
        this.health.setText(this.player.base_health);


        // logic for melee collisions
        // returns array reference
        let b = this.badguy_group.getChildren();
        // this happens too quickly :(
        // but it works
        for (let i=0;i<b.length;i++) {
            if (!b[i].active) continue;
            if (collision_check(this.player,b[i])) {
                this.player.base_health -= 10;
            }
        }


        // logic for poweup collision
        let p = this.powerup_group.getChildren();
        for (let i=0;i<p.length;i++) {
            if (!p[i].active) continue;
            if (collision_check(this.player,p[i])) {
                // do something here
                this.powerup_group.killAndHide(p[i]);

                // check powerup type
                this.player.fire_rate = 0.1;
            }
        }
        
        // no more enemies
        // or player is dead
        if ((this.badguy_group.countActive()==0) || (
            (this.player.base_health<0))
        ) {
            // TODO: unpause it at point point
            this.scene.manager.pause("game");
            this.scene.start("endlevel", { crud : 200});
        }
    }
}

function mainline() {
    scenes.push(BootScene);
    scenes.push(GameScene);
    scenes.push(EndLevelScene);
    game = new Phaser.Game(gameConfig);
    window.focus();
    resize();
    game.scene.start("boot");
}

window.onload = mainline;