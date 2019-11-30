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
        this.active = !stage.leverPressed;
        this.spr.setFrame(0, this.active ? 2 : 3);

        this.inCamera = false;
    
        this.textbox = textbox;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        // ...
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
            ...ev.loc.dialogue["lever"]
        );
        this.textbox.activate(WAIT_TIME, 
            -SHAKE_MAG, null, 
            0.0, 0.0);

        stage.leverPressed = true;
        this.active = false;

        ++ this.spr.frame;
    }


    // Draw translate
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.npc,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        c.move(-tx, -ty);
    }

}
