import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";

//
// A lever. Activates portals.
//
// (c) 2019 Jani Nykänen
//


export class Lever extends RenderedObject {

    
    constructor(x, y, id, textbox, pl, stage) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        this.flip = Flip.None;
        this.active = (stage.id == 0 && !stage.leverPressed)
            || (stage.id == 1 && !pl.hasGem);

        this.id = stage.id;

        if (stage.id == 0)
            this.spr.setFrame(0, this.active ? 2 : 3);
        else
            this.spr.setFrame(0, 4);

        this.inCamera = false;
    
        this.textbox = textbox;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        if (this.id == 1) {

            this.spr.animate(0, 4, 7, 6, ev.step);
        }
    }


    // Activate
    activate(pl, stage, ev) {

        const SHAKE_MAG = 4;
        const WAIT_TIME = 120;
        
        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.70);
        ev.audio.playSample(
            ev.audio.sounds.lever, 
            0.70);

        this.textbox.addMessage(
            ...ev.loc.dialogue["lever" + String(this.id)]
        );
        this.textbox.activate(WAIT_TIME, 
            -SHAKE_MAG, null, 
            0.0, 0.0);

        if (this.id == 0)
            stage.leverPressed = true;
        else if (this.id == 1)
            pl.hasGem = true;
            
        this.active = false;

        pl.showArrow = false;

        ++ this.spr.frame;
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        if (!this.active && this.id == 1) return;

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        c.move(-tx, -ty);
    }

}
