import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { Vector2 } from "./engine/vector.js";

//
// A base enemy class
//
// (c) 2019 Jani Nykänen
//


export class Enemy extends GameObject {


    constructor(x, y, id) {

        super(x, y);

        this.startPoint = this.pos.clone();
        this.hitArea = new Vector2();
        this.center = new Vector2();
        
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(id+1, 0);

        this.id = id;
        this.health = 1;
        this.maxHealth = 1;
        this.power = 1;

        this.exist = true;
        this.dying = false;
        this.inCamera = false;
        this.returned = false;

        this.flip = Flip.None;

        this.gemCreated = false;

        this.plAngle = 0;

        this.oldCanJump = false;
        this.canJump = false;

        this.isStatic = false;

        this.dir = 0;
    }


    // Hurt player
    hurtPlayer(pl, ev) {

        const KNOCKBACK_COMPARE = 0.01;
        const KNOCKBACK_BASE = 0.5;

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.hitArea.x/2;
        let h = this.hitArea.y/2;

        let angle, kb;
        if (pl.hurtCollision(px-w, py-h, w*2, h*2, ev, this.power) &&
            !this.isStatic) {

            // Compute knockback
            angle = Math.atan2(this.pos.y-pl.pos.y, 
                               this.pos.x-pl.pos.x);

            kb = KNOCKBACK_BASE * 
                Math.sqrt(Math.min(this.acc.x, this.acc.y) / 
                KNOCKBACK_COMPARE);

            this.speed.x = Math.cos(angle) * kb;
            this.speed.y = Math.sin(angle) * kb;
        }
    }


    // Control, i.e AI
    control(ev, extra) {

        // Update logic
        if (this.inCamera &&
            this.updateAI != null) {

            this.updateAI(extra[0], ev);
            this.hurtPlayer(extra[0], ev);
        }

        // Update timers
        if (this.hurtTimer > 0)
            this.hurtTimer -= ev.step;

        this.oldCanJump = this.canJump;
    }


    // Die
    die(ev, extra) {

        const DEATH_SPEED = 5;
        const GEM_SPEED = 1;
        const H_UP_PROB_BASE = 0.75;

        this.spr.animate(0, 0, 4, DEATH_SPEED, ev.step);
        if (this.spr.frame == 4)
            this.exist = false;

        let gemGen = extra[1];
        let pl = extra[0];
        let healthProb = H_UP_PROB_BASE * (1.0 - pl.health/pl.maxHealth);
        let id;
        if (!this.gemCreated) {

            id = 0;
            if (pl.health < pl.maxHealth && 
                Math.random() < healthProb) {

                id = 1;
            }

            gemGen.createElement(
                this.pos.x, this.pos.y,
                Math.cos(this.plAngle) * GEM_SPEED,
                Math.sin(this.plAngle) * GEM_SPEED,
                id);

            this.gemCreated = true;
        }
    }



    // Check if in camera
    isInCamera(cam) {

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.spr.w/2;
        let h = this.spr.h/2;

        let wasInCamera = this.inCamera;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py+h >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        // Return to the original position,
        // if outside the camera and the camera
        // has stopped moving
        if (!this.returned &&
            !this.inCamera && cam.stopped) {

            this.pos = this.startPoint.clone();
            this.speed = new Vector2();
            this.target = new Vector2();

            if (this.reset != null)
                this.reset();

            this.returned = true;
        }

        if (this.inCamera)
            this.returned = false;

        // This prevent some nasty bugs where
        // enemies suddenly reappear
        else if (wasInCamera &&
            !cam.moving && !cam.stopped) {

            this.exist = false;
        }
    }


    // Bullet collision
    bulletCollision(b, ev) {

        const HURT_TIME = 30;
        const KNOCKBACK_SPEED = 1.0;

        if (!b.exist || b.dying || 
            !this.exist || this.dying)
            return;

        let px = this.pos.x;
        let py = this.pos.y;
        let pw = this.w/2;
        let ph = this.h/2;

        let bx = b.pos.x;
        let by = b.pos.y;
        let bw = b.w/2;
        let bh = b.h/2;

        let col = 
            px+pw >= bx-bw &&
            px-pw <= bx+bw &&
            py+ph >= by-bh &&
            py-ph <= by+bh;

        let knockback = KNOCKBACK_SPEED * b.power;
        if (col) {

            b.kill(ev);

            this.hurtTimer = HURT_TIME;
            if ( (this.health -= b.power) <= 0) {

                this.dying = true;
                this.spr.setFrame(0, 0);
            }
            else if (!this.isStatic) {

                this.plAngle = Math.atan2(py-by, px-bx);
                this.speed.x = Math.cos(this.plAngle) * knockback;
                this.speed.y = Math.sin(this.plAngle) * knockback;
            }
        }
    }


    // Draw to the translated position
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.enemy,
            (this.pos.x-8 + this.center.x) | 0,
            (this.pos.y-8 + this.center.y) | 0,
            this.flip);

        c.move(-tx, -ty);
    }


    // Enemy-to-enemy collision
    enemyToEnemyCollision(e) {

        if (!this.exist || this.dying ||
            !e.exist || e.dying) return;

        let r1 = Math.hypot(this.w/2, this.h/2);
        let r2 = Math.hypot(e.w/2, e.h/2);

        let dist = Math.hypot(this.pos.x-e.pos.x, 
            this.pos.y-e.pos.y);

        let angle;
        let r;
        if (dist < r1 + r2) {

            r = r1 + r2 - dist;
            angle = Math.atan2(this.pos.y-e.pos.y, 
                this.pos.x-e.pos.x);

            // Modify speed & position
            if (!this.isStatic) {

                this.pos.x += Math.cos(angle) * r/2;
                this.pos.y += Math.sin(angle) * r/2;

                this.speed.x = Math.abs(this.speed.x) * Math.cos(angle);
                this.speed.y = Math.abs(this.speed.y) * Math.sin(angle);
            }

            if (!e.isStatic) {

                e.pos.x -= Math.cos(angle) * r/2;
                e.pos.y -= Math.sin(angle) * r/2;

                e.speed.x = -Math.abs(e.speed.x) * Math.cos(angle);
                e.speed.y = -Math.abs(e.speed.y) * Math.sin(angle);

                e.dir *= -1;
            }

        }
    }


    // Draw
    draw(c, stage, cam) {

        if (!this.exist) return;

        // If hurt, skip some frames
        if (this.hurtTimer > 0 && 
            Math.floor(this.hurtTimer/4) % 2 == 0)
            return;

        if (cam.moving) {

            // Okay, we do some unnecessary drawing here
            // Maybe extra camera checks were necessary?
            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        if (this.inCamera)
            this.drawTranslated(c, 0, 0);
    }


    // "Pre-render"
    preRenderAll(c, stage, cam) {

        if (!this.exist || this.dying || 
            this.preRender == null) return;

        if (cam.moving && cam.dir.x != 0) {

            let dx = 0;

            if (cam.dir.x > 0)
                dx = -stage.w*16;
            else if (cam.dir.x < 0)
                dx =  stage.w*16;

            c.move(dx, 0);
            this.preRender(c);
            c.move(-dx, 0);
        }

        // We do not do camera checks here,
        // to avoid certain elements disappearing
        this.preRender(c);
    }
}
