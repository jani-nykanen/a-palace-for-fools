import { GameObject } from "./gameobject.js";
import { Vector2 } from "./engine/vector.js";
import { State } from "./engine/input.js";
import { negMod } from "./engine/util.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";

// 
// Player object
//
// (c) 2019 Jani Nykänen
//


export class Player extends GameObject {


    constructor(x, y) {

        super(x, y);

        // Set acceleration
        this.acc = new Vector2(
            0.1, 0.15
        );

        this.jumpTimer = 0.0;

        this.w = 8;
        this.h = 12;

        this.spr = new Sprite(16, 16);
        this.gunSpr = new Sprite(8, 8);
        this.flip = Flip.None;

        this.shootAnimTimer = 0;
        this.shootDir = 1;
        this.canShoot = true;
    }


    // Update jump
    updateJump(ev) {

        const JUMP_SPEED = -2.0;

        if (this.jumpTimer <= 0.0) return;

        this.jumpTimer -= ev.step;
        this.speed.y = JUMP_SPEED;
    }


    // Update climbing controls
    climb(ev) {

        const CLIMB_SPEED = 0.5;

        this.target.x = 0;
        this.target.y = 0;

        if (this.shootAnimTimer <= 0) {

            // Moving up and down
            if (ev.input.action.up.state == State.Down) {

                this.target.y = -CLIMB_SPEED;
            }
            else if (ev.input.action.down.state == State.Down) {

                this.target.y = CLIMB_SPEED;
            }
        }
        

        if (!this.touchLadder)
            this.climbing = false;
    }


    // Shoot a bullet
    shootBullet(bgen, ev) {

        const SHOOT_ANIM_TIME = 30;
        const BULLET_SPEED = 3;

        // Determine shoot direction
         if (ev.input.action.left.state == State.Down) {

            this.shootDir = -1;
        }
        else if (ev.input.action.right.state == State.Down) {

            this.shootDir = 1;
        }
        else if (!this.climbing) {

            this.shootDir = this.flip == Flip.None ? 1 : -1;
        }

        this.shootAnimTimer = SHOOT_ANIM_TIME;
        this.canShoot = false;
        this.gunSpr.setFrame(0, 0);
        this.gunSpr.count = 0;

        let p = this.pos.x+12;
        if (this.shootDir == -1) {

            p -= 24;
        }

        let b = bgen.createBullet(
            p, this.pos.y, 
            BULLET_SPEED*this.shootDir, 0);
        if (b != null) {

            // This way we prevent bullets
            // going through walls
            b.oldPos.x = this.pos.x;
        }
    }


    // Control
    control(ev, extra) {

        const GRAVITY = 2.0;
        const WATER_GRAVITY = 0.5;
        const H_SPEED = 1.0;
        const JUMP_TIME = 15;
        const SWIM_SPEED_UP = -1.5;

        let bgen = extra[0];

        this.target.x = 0;
        this.target.y = 
            this.touchWater ? WATER_GRAVITY :  GRAVITY;

        // Shoot a bullet
        if (this.canShoot &&
            ev.input.action.fire2.state == State.Pressed) {
            
            this.shootBullet(bgen, ev);
        }

        // Update jump
        this.updateJump(ev);

        // Check jump button
        let s = ev.input.action.fire1.state;

        if (s == State.Down && this.touchWater) {

            this.target.y = SWIM_SPEED_UP;
        }
        else if (!this.touchWater) {

            if (s == State.Pressed) {

                if (this.climbing)
                    this.climbing = false;

                else if( this.canJump && this.jumpTimer <= 0.0) {

                    this.jumpTimer = JUMP_TIME;
                    this.canJump = false;

                    // Call this to get the proper
                    // vertical speed
                    this.updateJump(ev);
                }
            }
            else if(s == State.Released && this.jumpTimer > 0) {

                this.jumpTimer = 0.0;
            }
        }

        // Update climbing
        if (this.climbing) {

            this.climb(ev);
            return;
        }

        // Check climbing buttons
        if (this.touchLadder &&
            (ev.input.action.up.state == State.Pressed ||
            ev.input.action.down.state == State.Down)) {

            this.pos.x = this.ladderX + 8;
            this.speed.x = 0;
            this.speed.y = 0;
            this.target.x = 0;
            this.climbing = true;
            this.shootAnimTimer = 0;
            this.canShoot = true;
            this.jumpTimer = 0;

            // Required to get the speed
            this.climb(ev);

            return;
        }

        // Moving left and right
        if (ev.input.action.left.state == State.Down) {

            this.target.x = -H_SPEED;
        }
        else if (ev.input.action.right.state == State.Down) {

            this.target.x = H_SPEED;
        }
        
    }


    // Animate
    animate(ev) {

        const EPS = 0.01;
        const CLIMB_SPEED = 8;
        const WALK_SPEED_VARY = 5;
        const WALK_SPEED_BASE = 12;
        const AIR_FRAME_LIMIT = 0.5;
        const GUN_ANIM_SPEED = 4;

        let s;

        if (Math.abs(this.target.x) > EPS)
            this.flip = this.target.x > 0 ? 
                    Flip.None : Flip.Horizontal;

        // Update shoot animation timer
        if (this.shootAnimTimer > 0) {

            this.shootAnimTimer -= 1.0 * ev.step;

            // Update gun animation
            if (!this.canShoot) {

                this.gunSpr.animate(0, 0, 3, GUN_ANIM_SPEED, ev.step);
                if (this.gunSpr.frame == 3)
                    this.canShoot = true;
            }
        }
        let jump = this.shootAnimTimer > 0 ? 1 : 0;

        // Climbing
        if (this.climbing) {

            s = Math.abs(this.speed.y) > EPS ? 1 : 0;

            if (s == 1 || this.shootAnimTimer > 0 ||
                this.spr.frame >= 2) {

                this.spr.animate(2, 
                    Math.min(2*jump, 2),  Math.min(2*jump+s, 2), 
                    CLIMB_SPEED, ev.step);
            }
            
            this.flip = Flip.None;        
            if (this.shootAnimTimer > 0 && this.shootDir < 0 ) {

                this.flip = Flip.Horizontal;
            }    
        }
        // On ground
        else if(this.canJump) {

            if (Math.abs(this.target.x) > EPS) {
                
                s = WALK_SPEED_BASE - 
                    Math.abs(this.speed.x) * WALK_SPEED_VARY;

                this.spr.animate(0, 1, 4, s, ev.step);
            }
            else {

                this.spr.setFrame(0, 0);
            }
        }
        // Falling or jumping
        else {

            s = 6;
            if (this.speed.y <= -AIR_FRAME_LIMIT)
                s = 5;
            else if(this.speed.y >= AIR_FRAME_LIMIT)
                s = 7;

            this.spr.setFrame(0, s);
        }
    }


    // Update camera
    updateCamera(cam, stage) {

        if (this.pos.x-8 < cam.x*cam.w) {

            this.pos.x -= 16;
            -- cam.x;
        }
        else if (this.pos.x+8 > (cam.x+1)*cam.w) {

            this.pos.x += 16;
            ++ cam.x;
        }

        if (this.pos.y-8 < cam.y*cam.h) {

            this.pos.y -= 16;
            -- cam.y;
        }
        else if (this.pos.y+8 > (cam.y+1)*cam.h) {

            this.pos.y += 16;
            ++ cam.y;
        }


        this.pos.x = negMod(this.pos.x, stage.w*16);
        this.pos.y = negMod(this.pos.y, stage.h*16);

        cam.x = negMod(cam.x, (stage.w*16 / cam.w) | 0);
        cam.y = negMod(cam.y, (stage.h*16 / cam.h) | 0);
    }


    // Draw player
    draw(c) {

        let px = this.pos.x | 0;
        let py = this.pos.y | 0;

        py -= (16 - this.h)/2 -1;

        let row = this.spr.row;
        if (this.shootAnimTimer > 0 && !this.climbing) {

            row += 1;
        }

        c.drawSpriteFrame(this.spr, c.bitmaps.figure,
            this.spr.frame, row,
            px-8, py-8, this.flip);

        
        if (this.shootAnimTimer > 0) {

            if ((this.climbing && this.shootDir == -1) ||
                (!this.climbing && this.flip == Flip.Horizontal)) {

                px -= 18;
            }

            // Draw gun
            c.drawSprite(this.gunSpr, c.bitmaps.gun,
                px+5, py-3, this.flip);
        }
    }
}
