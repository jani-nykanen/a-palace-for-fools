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
        const WAIT_TIME1 = 120;
        const WAIT_TIME2 = 90;
        const ITEM_WAIT = 30;
        const ITEM_SPEED = -1.0;
        
        ev.audio.playSample(
            ev.audio.sounds.accept, 
            0.70);
        ev.audio.playSample(
            ev.audio.sounds[ ["lever", "craft"] [this.id] ], 
            0.70);

        this.textbox.addMessage(
            ...ev.loc.dialogue["lever" + String(this.id)]
        );
        
        this.textbox.activate(WAIT_TIME1, 
            -SHAKE_MAG, null, 
            0.0, 0.0);
            
        if (this.id == 1) {

            this.textbox.setEndCallback((ev) => {

                    // Play sound
                    ev.audio.playSample(ev.audio.sounds.item, 
                        0.50);

                    // Activate a new textbox
                    this.textbox.activate(WAIT_TIME2, 7, 
                        new Vector2(this.pos.x, this.pos.y-8), 
                        ITEM_SPEED, ITEM_WAIT)
                    }
                );
        }

        if (this.id == 0) {

            stage.leverPressed = true;
            ++ this.spr.frame;
        }
        else if (this.id == 1)
            pl.hasGem = true;
            
        this.active = false;

        // Set player position
        pl.pos.x = this.pos.x;
        pl.spr.setFrame(3, 3);
        pl.showArrow = false;
        pl.stopMovement();
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
