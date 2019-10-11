import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";
import { Vector2 } from "./engine/vector.js";

//
// A collectable gem
//
// (c) 2019 Jani Nykänen
//


export class Gem extends GameObject {


    constructor() {

        super(0, 0);

        this.exist = false;

        this.spr = new Sprite(8, 8);

        this.w = 6;
        this.h = 6;

        this.acc.x = 0.01;
        this.acc.y = 0.1;

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 0.9);
    }


    // Spawn
    spawn(x, y, sx, sy) {

        const GRAVITY = 2.0;

        this.exist = true;
        this.dying = false;

        this.target.x = 0;
        this.target.y = GRAVITY;

        this.speed.x = sx;
        this.speed.y = sy;

        this.pos.x = x;
        this.pos.y = y;

        this.oldPos = this.pos.clone();
    } 


    // Control
    control(ev, extra) {

        this.isInCamera(extra[0]);
    }


    // Animate
    animate(ev) {

        if (this.canJump) return;

        let speed = 16-Math.floor(this.speed.x)*8;

        if (this.speed.x >= 0)
            this.spr.animate(0, 0, 5, speed, ev.step);
        else 
            this.spr.animate(0, 5, 0, speed, ev.step);
    }


    // Check if in camera
    isInCamera(cam) {

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.spr.w/2;
        let h = this.spr.h/2;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py+h >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        if (!this.inCamera)
            this.exist = false;
    }



    // Player collision
    playerCollision(pl, ev) {

        if (!this.exist) return;

        let px = this.pos.x;
        let py = this.pos.y;
        let pw = this.w/2;
        let ph = this.h/2;

        let bx = pl.pos.x;
        let by = pl.pos.y;
        let bw = pl.w/2;
        let bh = pl.h/2;

        let col = 
            px+pw >= bx-bw &&
            px-pw <= bx+bw &&
            py+ph >= by-bh &&
            py-ph <= by+bh;

        if (col) {

            this.exist = false;

            ev.audio.playSample(ev.audio.sounds.gem, 0.80);
        }
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.gem,
            (this.pos.x-4) | 0,
            (this.pos.y-3) | 0);
    
    }
}