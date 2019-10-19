import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";


//
// That thing from Mario, but with slightly different
// graphics, 'cause I don't want to break copyright
// laws!
//
// (c) 2019 Jani Nykänen
//


export class Thwomp extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 16;
        this.h = 16;

        this.hitArea = new Vector2(8, 8);

        this.acc.x = 0.0;
        this.acc.y = 0.1;

        this.maxHealth = 3;
        this.health = this.maxHealth;

        this.spr.setFrame(5, 0);

        this.flip = Flip.None;

        this.isStatic = true;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        // ...
    }


    // Animate
    animate(ev) {

        // ...
    }
}
