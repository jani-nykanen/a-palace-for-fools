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


    constructor(x, y, id, cb, stage) {

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

        this.spr.animate(this.id, 
            1, 3, ANIM_SPEED, ev.step);
    }


    // Update
    update(pl, ev) {
        
        if (!this.inCamera) return;

        this.animate(ev);
    }


    // Camera movement animation
    cameraMoveAnimation(ev) {

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
    activate(pl, stage, ev) {

        const COLOR = [[170, 170, 0], [85, 170, 255]];

        pl.showArrow = false;

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
