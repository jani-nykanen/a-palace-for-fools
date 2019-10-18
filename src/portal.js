import { Sprite } from "./engine/sprite.js";
import { Vector2 } from "./engine/vector.js";

//
// A time-traveling portal
//
// (c) 2019 Jani Nykänen
//


export class Portal {


    constructor(x, y) {

        this.pos = new Vector2(x, y);

        this.w = 24;
        this.h = 32;

        this.spr = new Sprite(24, 32);

        this.active = true;

        this.inCamera = false;
    }


    // Update
    update(ev) {
        
        const ANIM_SPEED = 8;

        if (!this.inCamera) return;

        this.spr.animate(0, 1, 3, ANIM_SPEED, ev.step);
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
    }


    // Draw
    draw(c) {

        if (!this.inCamera) return;

        let px = (this.pos.x - this.spr.w/2) | 0;
        let py = (this.pos.y - this.spr.h) | 0;
        
        c.drawSprite(this.spr, c.bitmaps.door, px, py);
    }

}
