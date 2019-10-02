import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";

//
// A bullet
//
// (c) 2019 Jani Nykänen
//


export class Bullet extends GameObject {

    
    constructor(x, y) {

        super(x, y);

        this.exist = false;

        this.w = 8;
        this.h = 1;

        this.spr = new Sprite(8, 8);

        this.dieOnCollision = true;
    }


    // Die
    die(ev) {

        const DEATH_SPEED = 6;

        this.spr.animate(2, 0, 4, DEATH_SPEED, ev.step);
        if (this.spr.frame == 4)
            this.exist = false;
    }


    // "Control"
    control(ev, extra) {

        let cam = extra[0];

        let cx = cam.x * cam.w;
        let cy = cam.y * cam.h;

        // Check if outside the camera
        if (this.pos.x-this.w/2 > cx+cam.w ||
            this.pos.x+this.w/2 < cx ||
            this.pos.y-this.h/2 > cy+cam.h ||
            this.pos.y+this.h/2 < cy) {

            this.exist = false;
        }
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 2;

        this.spr.animate(1, 0, 3, ANIM_SPEED, ev.step);
    }


    // Spawn
    spawn(x, y, sx, sy) {

        this.pos.x = x;
        this.pos.y = y;

        this.speed.x = sx;
        this.speed.y = sy;

        this.target = this.speed.clone();

        this.exist = true;
        this.dying = false;
        this.spr.setFrame(1, 0);
        
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.gun,
            (this.pos.x | 0) - 4, 
            (this.pos.y | 0) - 4 );
    }
}
