import { Sprite } from "./engine/sprite.js";
import { Vector2, Vector3 } from "./engine/vector.js";
import { State } from "./engine/input.js";

//
// A time-traveling portal
//
// (c) 2019 Jani Nykänen
//


export class Portal {


    constructor(x, y, id, cb) {

        this.pos = new Vector2(x, y);

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
        let h = this.spr.h;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        if (this.inCamera && animate)
            this.animate(ev);
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        let px = (this.pos.x - this.spr.w/2) | 0;
        let py = (this.pos.y - this.spr.h) | 0;
        
        c.drawSprite(this.spr, c.bitmaps.door, px, py);

        c.move(-tx, -ty);
    }


    // Draw
    draw(c, stage, cam) {

        if (cam.moving) {

            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        if (!this.inCamera) return;

        this.drawTranslated(c, 0, 0);
    }


    // Check the collision with the player
    playerCollision(pl, ev) {

        const COLOR = [[170, 170, 0], [85, 170, 255]];

        if (!this.inCamera || !this.active || 
            !pl.canJump || pl.dying ||
            ev.input.action.up.state != State.Pressed) return;
    
        // Check if inside the collision area
        let px = pl.pos.x;
        let py = pl.pos.y;

        let pw = pl.w;
        let ph = pl.h;

        let tx = this.pos.x - this.w/2;
        let ty = this.pos.y - this.h;

        // If in the hurt area... activate
        // pain!
        if (px+pw > tx &&
            px-pw < tx+this.w &&
            py+ph/2 > ty &&
            py-ph/2 < ty+this.h) {

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

}
