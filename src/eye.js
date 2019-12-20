import { Enemy } from "./enemy.js";
import { Vector2 } from "./engine/vector.js";
import { Sprite } from "./engine/sprite.js";
import { clamp } from "./engine/util.js";

//
// The final boss.
//
// (c) 2019 Jani Nykänen
//

const APPEAR_TIME = 60;
const OPEN_TIME = 30;
const OPEN_PLUS = 30;


export class Eye extends Enemy {


    constructor(x, y) {

        super(x, y, 0);

        this.w = 40;
        this.h = 40;

        this.hitArea = new Vector2(24, 24);

        this.acc.x = 0.010;
        this.acc.y = 0.010;

        this.maxHealth = 30;
        this.health = this.maxHealth;

        this.spr = new Sprite(48, 48);
        this.spr.setFrame(1, 3);

        this.bounce = true;
        this.bounceFactor = new Vector2(1, 1);

        this.ignoreLadder = true;
        this.preventLeaving = true;

        this.appearTimer = APPEAR_TIME;
        this.waitTime = 0;
        this.fadingIn = false;

        this.extraWait = 0;
        this.mode = 0;

        this.barPos = 1.0;
    }


    // Reset
    reset() {

        this.appearTimer = APPEAR_TIME;
    }


    // Re-appear
    reappear() {
        
        const MAX_Y = 144-16;

        let x = this.spr.w/2 + ((Math.random() * (160 - this.spr.w)) | 0);
        let y = this.spr.h/2 + ((Math.random() * (MAX_Y - this.spr.h)) | 0);

        this.pos.x = x;
        this.pos.y = y;

        this.mode = (Math.random()*2) | 0;
        this.isStatic = false;

        switch(this.mode) {

        case 0:
            this.spr.row = 1;
            break;

        case 1:
            this.isStatic = true;
            this.spr.row = 3;
            break;

        default:
            break;
        }
    }


    // "Ram"
    ram(pl) {

        const WAIT_TIME = 45;

        const FLY_SPEED_MIN = 1.0;
        const FLY_SPEED_VARY = 1.0;

        let angle = Math.atan2(
            this.pos.y-pl.pos.y,
            this.pos.x-pl.pos.x);

        let s = FLY_SPEED_MIN + Math.random() * FLY_SPEED_VARY;

        this.speed.x = -Math.cos(angle) * s;
        this.speed.y = -Math.sin(angle) * s;

        this.waitTime = WAIT_TIME * s;
    }


    // Open eye
    openEye(bgen, ev) {

        const BULLET_COUNT = 4;
        const BULLET_SPEED = 1.5;

        this.waitTime = OPEN_TIME + OPEN_PLUS;

        let angleStart = ((Math.random()*2) | 0 ) * (Math.PI/4.0);
        let angle;

        // Create bullets
        let b;
        for (let i = 0; i < BULLET_COUNT; ++ i) {

            angle = angleStart + i * (Math.PI*2 / BULLET_COUNT);

            b = bgen.createElement(
                this.pos.x, 
                this.pos.y, 
                -Math.cos(angle) * BULLET_SPEED, 
                -Math.sin(angle) * BULLET_SPEED, 3);
            if (b != null) {

                // This way we prevent bullets
                // going through walls
                b.oldPos.x = this.pos.x;
                b.oldPos.y = this.pos.y;
            }
        }
        ev.audio.playSample(ev.audio.sounds.shootBig, 0.50);
    }


    // Update AI
    updateAI(pl, ev, bgen) {

        const EXTRA_WAIT_MIN = 30;
        const EXTRA_WAIT_VARY = 30;
        const BAR_SPEED = 0.005;

        this.target.x = 0;
        this.target.y = 0;

        // Update health bar position
        let t = this.health/this.maxHealth;
        if (t < this.barPos) {

            this.barPos -= BAR_SPEED * ev.step;
            this.barPos = Math.max(t, this.barPos);
        }

        // let len = Math.hypot(this.speed.x, this.speed.y);

        this.harmless = this.appearTimer > 0;

        // Appear
        if (this.appearTimer > 0) {

            if (!this.fadingIn) {

                this.speed.x = 0;
                this.speed.y = 0;
            }

            this.appearTimer -= ev.step;
            
            if (this.appearTimer <= 0.0) {

                if (this.fadingIn) {

                    this.extraWait = 0.0;
                    this.appearTimer += APPEAR_TIME;
                    this.fadingIn = false;

                    // Jump to new position
                    this.reappear();
                }
                else {

                    if (this.mode == 0)
                        this.ram(pl);
                    
                    else if (this.mode == 1)
                        this.openEye(bgen, ev);
                }
            }

            return;
        }


        if ( (this.waitTime -= ev.step) <= 0) {

            this.extraWait = EXTRA_WAIT_MIN
                + ((Math.random() * EXTRA_WAIT_VARY) | 0);

            this.appearTimer = APPEAR_TIME + this.extraWait;
            this.fadingIn = true;
        }
    }


    // Animate fading
    fade() {

        let t = (this.appearTimer-this.extraWait) / APPEAR_TIME;
        t = clamp(t, 0, 1);
        if (this.fadingIn)
            t = 1.0 - t;

        let frame = Math.min((t * 4) | 0, 3);

        this.spr.setFrame(this.spr.row, frame);
    }


    // Animate opening eye
    animateEye() {

        let t = Math.max(0, this.waitTime-OPEN_PLUS) / OPEN_TIME;
        let row = ((t * 3) | 0);

        this.spr.row = row;
    }


    // Animate
    animate(ev) {

        if (this.appearTimer > 0) {

            this.fade();
        }
        else {

            // Animate opening eye
            if (this.mode == 1) {

                this.animateEye();
            }
        }
    }


    // Draw health bar
    drawHealthBar(c) {

        const WIDTH = 80;
        const HEIGHT = 6;
        const OFF = 3;
        const GRADIENT_OFF = 1;

        const COLORS = [
            [170, 0, 0],
            [255, 85, 0],
            [255, 255, 255]
        ];

        let tx = 160/2 - WIDTH/2;
        let ty = 144 - HEIGHT - OFF;

        c.setColor(0, 0, 0);
        c.fillRect(tx-1, ty-1,
            WIDTH+2, HEIGHT+2
        );

        let t = this.barPos;
        let p = (t * WIDTH) | 0;

        c.setColor(85);
        c.fillRect(tx, ty,
            WIDTH, HEIGHT
        );

        let off = ((HEIGHT/COLORS.length)/2) | 0;
        for (let i = 0; i < COLORS.length; ++ i) {

            c.setColor(...COLORS[i]);
            c.fillRect(tx, ty+off*i,
                p, HEIGHT-off*i*2 - GRADIENT_OFF*Math.min(1, i)
            );
        }

        if (this.health < this.maxHealth) {

            c.setColor(0);
            c.fillRect(tx + p, ty, 1, HEIGHT);
        }
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


    // Draw after everything else
    postDraw(c) {
        
        this.drawHealthBar(c);
    }
}
