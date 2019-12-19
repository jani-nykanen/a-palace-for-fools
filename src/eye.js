import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";

//
// The final boss.
//
// (c) 2019 Jani Nykänen
//


const INITIAL_WAIT = 30;
const APPEAR_TIME = 90;


export class Eye extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 40;
        this.h = 40;

        this.hitArea = new Vector2(36, 36);

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.maxHealth = 30;
        this.health = this.maxHealth;

        this.spr = new Sprite(48, 48);
        this.spr.setFrame(0, 0);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.timer = INITIAL_WAIT;

        this.ignoreLadder = true;
        this.preventLeaving = true;

        this.appearTimer = APPEAR_TIME;
        this.fadingIn = false;
    }


    // Reset
    reset() {

        this.timer = INITIAL_WAIT;
        this.appearTimer = APPEAR_TIME;
    }


    // Update AI
    updateAI(pl, ev) {

        const FLY_SPEED = 1.0;
        const EPS = 0.1;

        this.target.x = 0;
        this.target.y = 0;

        let angle;
        let len = Math.hypot(this.speed.x, this.speed.y);

        // Appear
        if (this.appearTimer > 0) {

            this.speed.x = 0;
            this.speed.y = 0;

            this.appearTimer -= ev.step;
            
            if (this.appearTimer <= 0.0) {

                if (this.fadingIn) {

                    this.appearTimer += APPEAR_TIME;
                    this.fadingIn = false;
                }
                else {

                    angle = Math.atan2(
                        this.pos.y-pl.pos.y,
                        this.pos.x-pl.pos.x);
            
                    this.speed.x = -Math.cos(angle) * FLY_SPEED;
                    this.speed.y = -Math.sin(angle) * FLY_SPEED;
                }
            }
        }
        else if (len < EPS) {

            this.appearTimer = APPEAR_TIME;
            this.fadingIn = true;
        }
    }


    // Animate
    animate(ev) {

        let t = Math.min(Math.ceil((this.appearTimer / APPEAR_TIME)*4), 3);
        if (this.fadingIn)
            t = 3 - t;

        this.spr.setFrame(this.spr.row, t);
    }


    // Draw to the translated position
    // (overriden)
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.eye,
            (this.pos.x-24 + this.center.x) | 0,
            (this.pos.y-24 + this.center.y) | 0,
            this.flip);

        c.move(-tx, -ty);
    }
}
