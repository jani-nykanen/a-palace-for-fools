import { Flip } from "./engine/canvas.js";
import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";

//
// A monster who follows the player
//
// (c) 2019 Jani Nykänen
//


export class Zombie extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 8;
        this.h = 14;

        this.hitArea = new Vector2(4, 4);

        this.acc.x = 0.025;
        this.acc.y = 0.1;

        this.maxHealth = 2;
        this.health = this.maxHealth;

        this.spr.setFrame(2, 4);

        this.dir = ((x/16)|0) % 2 == 0 ? -1 : 1;

        this.center.y = -1;
        this.pos.y += (16 - this.h) + this.center.y;
        this.startPoint.y = this.pos.y;
        this.canJump = true;

        this.bounce = true;
        this.bounceFactor.x = 1;
        this.bounceFactor.y = 0;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        const SPEED = 0.5;
        const GRAVITY = 2.0;

        this.dir = pl.pos.x < this.pos.x ? -1 : 1;

        this.target.x = this.dir * SPEED;
        this.target.y = GRAVITY;
    }


    // Animate
    animate(ev) {

        const ANIM_SPEED = 8;

        this.flip = this.dir == 1 ? Flip.Horizontal : Flip.None;
        this.spr.animate(3, 0, 3, ANIM_SPEED, ev.step);
    }
}
