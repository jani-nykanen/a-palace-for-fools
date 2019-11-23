import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";

//
// A place to save the progress
//
// (c) 2019 Jani Nykänen
//


export class SavePoint extends RenderedObject {

    
    constructor(x, y, textbox) {

        super(x, y);

        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        this.flip = Flip.None;

        this.inCamera = false;
    
        this.textbox = textbox;
        this.color = 0;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        const ANIM_SPEED = 6;

        // Animate
        this.color = pl.checkID == this ? 1 : 0;
        this.spr.animate(this.color, 0, 7, ANIM_SPEED, ev.step);
    }


    // Touch player event
    touchPlayer(pl, ev) {

        if (pl.checkID != this) {

            pl.checkpoint = this.pos.clone();
            pl.checkpoint.y += 2;

            pl.checkID = this;

            ev.audio.playSample(ev.audio.sounds.checkpoint, 0.60);
        }
    }


    // Activate
    activate(pl, stage, ev) {

        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.60);

        this.textbox.addMessage(
            ev.loc.dialogue.savepoint[0]
        );
        this.textbox.activate((ev) => {

            this.textbox.addMessage(
                ev.loc.dialogue.savepoint[1]
            );
            this.textbox.activate();
        });
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.savepoint,
            (this.pos.x-8) | 0,
            (this.pos.y-7) | 0,
            this.flip);

        c.move(-tx, -ty);
    }

}
