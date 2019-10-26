import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { RenderedObject } from "./renderedobject.js";
import { Vector2 } from "./engine/vector.js";

//
// A chest that contains an item
//
// (c) 2019 Jani Nykänen
//


export class Chest extends RenderedObject {

    
    constructor(x, y, id, textbox, makeActive) {

        super(x, y);

        this.id = id;
        this.w = 4;
        this.h = 16;

        this.spr = new Sprite(16, 16);
        if (id == -1)
            this.spr.setFrame(2, 0);
        else
            this.spr.setFrame(1, 0);
            
        this.flip = (((x/16)|0) % 2 == 0  && this.id >= 0)
            ? Flip.Horizontal : Flip.None;

        this.inCamera = false;
    
        this.textbox = textbox;

        this.active = makeActive;
        if (!this.active)
            ++ this.spr.frame;
    }


    // Update
    update(pl, ev) {

        if (!this.inCamera) return;

        // ...
    }


    // Item effect
    itemEffect(pl, ev) {

        switch(this.id) {

            case -1:
                ++ pl.health;
                ++ pl.maxHealth;
                break;

            default:
                break;
        }
    }


    // Activate
    activate(pl, stage, ev) {

        const WAIT_TIME = 90;
        const ITEM_WAIT = 30;
        const ITEM_SPEED = -0.5;

        this.textbox.addMessage(
            ...ev.loc.dialogue["item" + String(this.id+1)]
        );
        this.textbox.activate(WAIT_TIME, this.id+1, 
            new Vector2(this.pos.x, this.pos.y-8), 
            ITEM_SPEED, ITEM_WAIT);

        ++ this.spr.frame;

        if (this.id >= 0) {
            // Make player crouch near the chest
            pl.pos.x = this.pos.x + 8*(this.flip == Flip.None ? -1 : 1);
            pl.pos.y = this.pos.y + 2;
            pl.spr.setFrame(3, 2);
            pl.flip = this.flip;
        }

        pl.showArrow = false;
        pl.stopMovement();

        // Play sound
        ev.audio.playSample(ev.audio.sounds.item, 0.50);

        // Apply item effect
        this.itemEffect(pl, ev);

        // Update chest array to make sure this
        // chest is not made active upon respawn
        stage.updateChestBuffer((this.pos.x/16)|0, (this.pos.y/16)|0, true);

        this.active = false;
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


    // Draw
    draw(c, stage, cam) {

        if (cam.moving) {

            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        if (this.inCamera);
            this.drawTranslated(c, 0, 0);
    }

}
