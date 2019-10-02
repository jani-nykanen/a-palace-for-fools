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
        this.spr = new Sprite(16, 16);
        this.speed = 0;
    }


    // Spawn
    spawn(x, y, speed) {

        this.pos = new Vector2(x, y);
        this.spr.setFrame(3, 0);
        this.speed = speed;

        this.exist = true;
    }


    // Update
    update(ev) {

        if (!this.exist) return;

        this.spr.animate(3, 0, 4, this.speed, ev.step);
        if (this.spr.frame == 4)
            this.exist = false;
    }


    // Draw
    draw(c) {

        if (!this.exist) return;

        c.drawSprite(this.spr, c.bitmaps.figure,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0);
    }

}
