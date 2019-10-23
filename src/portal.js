import { Sprite } from "./engine/sprite.js";
import { Vector2, Vector3 } from "./engine/vector.js";
import { State } from "./engine/input.js";
import { RenderedObject } from "./renderedobject.js";

//
// A time-traveling portal
//
// (c) 2019 Jani Nykänen
//


export class Portal extends RenderedObject {


    constructor(x, y, id, cb) {

        super(x, y);

        // Collision dimensions
        this.w = 4;
        this.h = 32;

        if (id == null)
            id = 0;

        this.spr = new Sprite(24, 32);
        this.spr.setFrame(id, 0);
        this.id = id;

        this.active = true;
        this.cb = cb;

        this.inCamera = false;
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 8;

        if (!this.inCamera) return;

        this.spr.animate(this.id, 1, 3, ANIM_SPEED, ev.step);
    }


    // Update
    update(ev) {
        
        this.animate(ev);
    }


    // Check if in camera
    isInCamera(cam, ev, animate) {

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.spr.w/2;
        let h = this.spr.h/2;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py+h >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        if (this.inCamera && animate)
            this.animate(ev);
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        let px = (this.pos.x - this.spr.w/2) | 0;
        let py = (this.pos.y - this.spr.h/2) | 0;
        
        c.drawSprite(this.spr, c.bitmaps.door, px, py);

        c.move(-tx, -ty);
    }


    // Activate
    activate(pl, ev) {

        const COLOR = [[170, 170, 0], [85, 170, 255]];

        // Play sound
        ev.audio.playSample(ev.audio.sounds.teleport,
            0.50);

        // Set player position
        pl.pos.x = this.pos.x;
        pl.checkpoint = pl.pos.clone();

        // Set player pose
        pl.setPortalPose(true);

        // Call callback function, if any
        if (this.cb != null) {

            this.cb(ev, pl, COLOR[this.id]);
        }
    }

}
