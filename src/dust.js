import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";

//
// Good ol' dust. In other words,
// something that appears, gets smaller
// and disappears
//
// (c) 2019 Jani Nykänen
//


export class Dust {


    constructor() {

        this.pos = new Vector2();
        this.exist = false;
        this.spr = new Sprite(32, 32);
        this.speed = 0;
    }


    // Spawn
    spawn(x, y, speed, row) {

        if (row == null) row = 0;

        this.pos = new Vector2(x, y);
        this.spr.setFrame(row, 0);
        this.speed = speed;

        this.exist = true;
    }


    // Update
    update(ev) {

        if (!this.exist) return;

        this.spr.animate(this.spr.row, 
            0, 4, this.speed, ev.step);
        if (this.spr.frame == 4)
            this.exist = false;
    }


    // Draw
    draw(c, id) {

        if (!this.exist) return;

        let t = c.bitmaps.dustA;
        if (id == 1) {

            t = c.bitmaps.dustB;
        }

        c.drawSprite(this.spr, t,
            (this.pos.x-16) | 0,
            (this.pos.y-16) | 0);
    }

}
