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
        this.active = false;
        this.returning = false;
        this.waitTimer = 0;
    }


    // Reset
    reset() {

        // ...
    }


    // Update AI
    updateAI(pl, ev) {

        const WAIT_TIME = 60;

        const EPS = 32;
        const GRAVITY = 4.0;
        const RETURN_SPEED = -0.5;

        if (this.waitTimer > 0) {

            this.waitTimer -= 1.0 * ev.step;
            this.target.y = 0;
            this.speed.y = 0;
            return;
        }

        if (!this.active) {

            if (Math.abs(pl.pos.x-this.pos.x) < EPS) {

                this.active = true;
            }
        }
        else {

            if (this.returning) {

                this.target.y = RETURN_SPEED;
                this.speed.y = RETURN_SPEED;
            }
            else {

                this.target.y = GRAVITY;
                if (this.canJump) {

                    this.returning = true;
                    this.waitTimer = WAIT_TIME;
                }
            }
        }
    }


    // Animate
    animate(ev) {

        if (!this.active) {

            this.spr.setFrame(5, 0);
        }
        else {

            this.spr.setFrame(5, 2);
        }
    }
}
