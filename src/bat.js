import { Enemy } from "./enemy.js";

//
// Bat enemy
//
// (c) 2019 Jani Nykänen
//


export class Bat extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 12;
        this.h = 12;

        this.acc.x = 0.01;
        this.acc.y = 0.01;

        this.active = false;
        this.falling = false;
    }


    // Reset
    reset() {

        this.active = false;
        this.falling = false;
    }


    // Update AI
    updateAI(pl, ev) {

        const TARGET_SPEED = 0.5;
        const TRIGGER_DIST_X = 40;
        const TRIGGER_DIST_Y = 64;
        const ACTIVE_EPS = 0.25;
        const FALL_SPEED = 1.5;

        let angle;
        let dist = Math.abs(this.pos.x - pl.pos.x);

        this.acc.y = this.active ? 0.01 : 0.05;

        if (this.active) {

            angle = Math.atan2(
                this.pos.y-pl.pos.y,
                this.pos.x-pl.pos.x);

            this.target.x = -Math.cos(angle) * TARGET_SPEED;
            this.target.y = -Math.sin(angle) * TARGET_SPEED;
        }
        else {

            this.target.x = 0;
            this.target.y = 0;

            if (!this.falling &&
                pl.pos.y > this.pos.y &&
                pl.pos.y - this.pos.y < TRIGGER_DIST_Y &&
                dist <= TRIGGER_DIST_X) {

                this.speed.y = FALL_SPEED;
                this.falling = true;
            }
            else if (this.falling &&
                this.speed.y <= ACTIVE_EPS) {

                this.falling = false;
                this.active = true;
            }
        }
    }


    // Animate
    animate(ev) {

        if (this.active)
            this.spr.animate(0, 0, 3, 6, ev.step);
        
        else 
            this.spr.setFrame(0, this.falling ? 5 : 4);
    }
}
