import { GameObject } from "./gameobject.js";
import { Vector2 } from "./engine/vector.js";
import { State } from "./engine/input.js";
import { negMod } from "./engine/util.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { Dust } from "./dust.js";

// 
// Player object
//
// (c) 2019 Jani Nykänen
//


const KNOCKBACK_TIME = 30;
const HURT_TIME = 60;
const DEATH_TIME = 120;
const SHOOT_ANIM_TIME = 60;


export class Player extends GameObject {


    constructor(x, y) {

        super(x, y);

        const DUST_COUNT = 8;
        const STARTING_HEALTH = 3;

        this.checkpoint = this.pos.clone();

        // Set acceleration
        this.acc = new Vector2(
            0.1, 0.15
        );

        this.jumpTimer = 0.0;
        this.slideTimer = 0;
        this.slideDir = 1;

        this.rocketTimer = 0.0;
        this.rocketActive = false;

        this.w = 8;
        this.h = 12;

        this.spr = new Sprite(16, 16);
        this.spr.setFrame(3, 4);

        this.gunSpr = new Sprite(8, 8);
        this.flip = Flip.None;

        this.shootAnimTimer = 0;
        this.chargeLoadTimer = 0;
        this.shootDir = 1;
        this.canShoot = true;
        
        this.dust = new Array(DUST_COUNT);
        for (let i = 0; i < DUST_COUNT; ++ i) {

            this.dust[i] = new Dust();
        }
        this.dustTimer = 1;

        this.hurtTimer = 0;

        // Old "can jump" state, required to
        // prevent y knockback in collisions
        this.canJumpOld = true;
        this.canJump = true;

        this.maxHealth = STARTING_HEALTH;
        this.health = this.maxHealth;

        this.deathTimer = 0;
    }


    // Respawn
    respawn(cam) {

        // Reset position to the latest checkpoint
        this.pos = this.checkpoint.clone();

        // Reset frame
        this.spr.setFrame(3, 4);

        // Reset speed
        this.speed = new Vector2();
        this.target = this.speed.clone();
        
        // ...and reset flags
        this.climbing = false;
        this.touchLadder = false;
        this.touchWater = false;
        this.rocketActive = false;
        this.dying = false;

        // ...and other stuff
        this.health = this.maxHealth;
        this.hurtTimer = 0;
        this.shootAnimTimer = 0;
        this.rocketTimer = 0;
        this.slideTimer = 0;
        this.deathTimer = 0;
        this.chargeLoadTimer = 0.0;

        // Set camera
        cam.forceMoveTo(
            Math.floor(this.pos.x / cam.w),
            Math.floor(this.pos.y / cam.h));
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
    shootBullet(bgen, id, ev) {

        const BULLET_SPEED = 3;
        const AUDIO = ["shoot", "shootBig"];

        // Play shooting sound
        ev.audio.playSample(ev.audio.sounds[AUDIO[id]], 0.50);

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

        let b = bgen.createElement(
            p, this.pos.y, 
            BULLET_SPEED*this.shootDir, 0,
            id);
        if (b != null) {

            // This way we prevent bullets
            // going through walls
            b.oldPos.x = this.pos.x;
        }
    }


    // Update sliding
    updateSlide(ev) {

        const SLIDE_SPEED = 1.5;

        this.slideTimer -= 1.0 * ev.step;
        // Release jump
        if (ev.input.action.fire1.state == State.Up) {

            this.slideTimer = 0.0;
        }

        this.speed.x = SLIDE_SPEED * this.slideDir;
        this.target.x = this.speed.x;
    }


    // Update dust
    updateDust(ev) {
        
        const DUST_TIME = 6;
        const DUST_SPEED = 8;

        // Update dust
        for (let d of this.dust) {

            d.update(ev);
        }

        // Check dust timer
        let dust;
        let x;
        if (this.dustTimer <= 0) {

            for (let d of this.dust) {

                if (d.exist == false) {

                    dust = d;
                    break;
                }
            }
            if (dust == null) return;

            if (this.flip == Flip.None)
                x = -2;
            else
                x = 2;

            dust.spawn(
                this.pos.x + x, 
                this.pos.y+2, DUST_SPEED);

            this.dustTimer += DUST_TIME;

            // Play gas sound
            ev.audio.playSample(ev.audio.sounds.gas, 0.40);
        }
    }


    // Update rocket
    updateRocket(ev) {

        const ROCKET_SPEED = 0.25;
        const SPEED_CAP = -1.5;

        // Stop rocketing, if touching ground, climbing
        // or on water
        if (this.canJump || this.climbing ||
            this.touchWater) {

            this.rocketActive = false;
        }

        if (ev.input.action.fire1.state == State.Down &&
            this.rocketTimer > 0.0) {

            this.speed.y -= ROCKET_SPEED * ev.step;
            this.speed.y = Math.max(this.speed.y, SPEED_CAP);

            this.rocketTimer -= 1.0 * ev.step;
            this.dustTimer -= 1.0 * ev.step;

            this.forceUp = true;
        }
    }


    // Control
    control(ev, extra) {

        const GRAVITY = 2.0;
        const WATER_GRAVITY = 0.5;
        const H_SPEED = 1.0;
        const JUMP_TIME = 15;
        const SLIDE_TIME = 36;
        const SWIM_SPEED_UP = -1.5;
        const ROCKET_TIME = 45;
        const BASE_HEIGHT = 12;
        const CHARGE_TIME_MAX = 60;

        let bgen = extra[0];

        this.target.x = 0;
        this.target.y = 
            this.touchWater ? WATER_GRAVITY :  GRAVITY;

        this.forceUp = false;
        this.canJumpOld = this.canJump;

        // Determine hitbox height
        this.hitbox.y = this.slideTimer > 0 ?
            BASE_HEIGHT/2 : BASE_HEIGHT;

        // Update shooting related timers
        let s = ev.input.action.fire2.state;
        let oldShootTimer = this.shootAnimTimer;
        this.shootAnimTimer -= 1.0 * ev.step;
        // Start charge shot
        if (this.chargeLoadTimer <= 0 &&
            oldShootTimer > 0 &&
            this.shootAnimTimer <= 0 &&
            this.hurtTimer <= HURT_TIME &&
            s== State.Down) {

            this.chargeLoadTimer = ev.step;
            ev.audio.playSample(ev.audio.sounds.charge, 0.50);
        }
        else if (this.shootAnimTimer < SHOOT_ANIM_TIME/2 &&
            s != State.Down) {

            this.shootAnimTimer = 0.0;
        }
        if (this.chargeLoadTimer > 0) {

            this.chargeLoadTimer += ev.step;
            // It never goes zero this way, but not too big
            // either
            if (this.chargeLoadTimer > CHARGE_TIME_MAX) {

                this.chargeLoadTimer -= CHARGE_TIME_MAX;
            }

            if (s == State.Released) {

                this.chargeLoadTimer = 0.0;
                this.shootBullet(bgen, 1, ev);
            }
        }

        // Update dust
        this.updateDust(ev);

        // Update hurt timer
        if (this.hurtTimer > 0) {

            this.hurtTimer -= ev.step;
            if (this.hurtTimer >= HURT_TIME)
                return;

            else if (this.health <= 0) {

                this.dying = true;
                this.deathTimer = DEATH_TIME;

                // Play sound effect
                ev.audio.playSample(ev.audio.sounds.die, 0.33);

                return;
            }
        }

        // Update rocketing
        if (this.rocketActive) {

            this.updateRocket(ev);
        }

        // Shoot a bullet
        if (this.canShoot &&
            this.slideTimer <= 0.0 &&
            ev.input.action.fire2.state == State.Pressed) {
            
            this.shootBullet(bgen, 0, ev);
        }

        // Update jump
        this.updateJump(ev);

        // Update slide
        if (this.slideTimer > 0) {

            this.updateSlide(ev);
            return;
        }

        // Check jump button
        s = ev.input.action.fire1.state;
        if ( (s == State.Down || s == State.Pressed) && this.touchWater) {

            if (s == State.Pressed) {

                ev.audio.playSample(ev.audio.sounds.jump, 0.50);
            }

            this.target.y = SWIM_SPEED_UP;
        }
        else if (!this.touchWater) {

            if (s == State.Pressed) {

                if (this.climbing) {

                    ev.audio.playSample(ev.audio.sounds.jump, 0.50);
                    this.climbing = false;
                }
                else if (this.canJump) {

                    // If down key down, slide
                    if (ev.input.action.down.state == State.Down) {

                        this.slideTimer = SLIDE_TIME;
                        this.shootAnimTimer = 0.0;
                        this.canShoot = true;

                        ev.audio.playSample(ev.audio.sounds.slide, 0.50);
                    }
                    else {

                        this.jumpTimer = JUMP_TIME;
                        this.canJump = false;

                        // Call this to get the proper
                        // vertical speed
                        this.updateJump(ev);

                        // Play jump sound
                        ev.audio.playSample(ev.audio.sounds.jump, 0.50);

                    }
                }
                else if (!this.canJump && !this.rocketActive) {

                    this.rocketActive = true;
                    this.rocketTimer = ROCKET_TIME;

                    this.speed.y = 0;
                    this.target.y = 0;
                }
            }
            else if(s == State.Released) {

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
            ev.input.action.down.state == State.Pressed)) {

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

            ev.audio.playSample(ev.audio.sounds.climb, 0.50);

            return;
        }

        // Moving left and right
        if (ev.input.action.left.state == State.Down) {

            this.target.x = -H_SPEED;
            this.slideDir = -1;
        }
        else if (ev.input.action.right.state == State.Down) {

            this.target.x = H_SPEED;
            this.slideDir = 1;
        }
        
    }


    // Animate
    animate(ev) {

        const EPS = 0.01;
        const CLIMB_SPEED = 10;
        const WALK_SPEED_VARY = 5;
        const WALK_SPEED_BASE = 12;
        const AIR_FRAME_LIMIT = 0.5;
        const GUN_ANIM_SPEED = 4;

        let s;

        // Knockback
        if (this.hurtTimer >= HURT_TIME) {

            this.spr.setFrame(2, 4);

            return;
        }

        if (Math.abs(this.target.x) > EPS)
            this.flip = this.target.x > 0 ? 
                    Flip.None : Flip.Horizontal;

        // Update shoot animation
        if (this.shootAnimTimer > 0) {

            // Update gun animation
            if (!this.canShoot) {

                this.gunSpr.animate(0, 0, 3, GUN_ANIM_SPEED, ev.step);
                if (this.gunSpr.frame == 3)
                    this.canShoot = true;
            }
        }
        let jump = this.shootAnimTimer > 0 ? 1 : 0;
        let oldFrame = this.spr.frame;
        let oldRow = this.spr.row;

        // Climbing
        if (this.climbing) {

            s = Math.abs(this.speed.y) > EPS ? 1 : 0;

            if (s == 1 || this.shootAnimTimer > 0 ||
                this.spr.frame >= 2) {

                this.spr.animate(2, 
                    Math.min(2*jump, 2),  Math.min(2*jump+s, 2), 
                    CLIMB_SPEED, ev.step);

                if (this.spr.frame != oldFrame &&
                    this.spr.row == oldRow &&
                    this.spr.frame == 0 &&
                    oldFrame < 2) {

                    ev.audio.playSample(ev.audio.sounds.climb, 0.40);
                }
            }
            
            this.flip = Flip.None;        
            if (this.shootAnimTimer > 0 && this.shootDir < 0 ) {

                this.flip = Flip.Horizontal;
            }    
        }
        // Sliding
        else if (this.slideTimer > 0) {

            this.spr.setFrame(2, 3);
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
            else if (this.speed.y >= AIR_FRAME_LIMIT)
                s = 7;

            this.spr.setFrame(this.rocketActive ? 2 : 0, s);
        }
    }


    // Update camera
    updateCamera(cam, stage, ev) {

        const CAM_SPEED = 4;

        if (cam.moving) return;

        this.verticalCollision(cam.x*cam.w, cam.y*cam.h, 144, 1, ev);
        this.verticalCollision((cam.x+1)*cam.w, cam.y*cam.h, 144, -1, ev);

        let dx = 0;
        let dy = 0;

        if (this.flip == Flip.Horizontal &&
            this.pos.x-8 < cam.top.x) {

            dx = -1;
        }
        else if (this.flip == Flip.None &&
            this.pos.x+8 > cam.top.x + cam.w) {

            dx = 1;
        }

        if (this.pos.y-8 < cam.top.y) {

            dy = -1
        }
        else if (this.pos.y+6 > cam.top.y + cam.h) {

            dy = 1;
        }
        
        let sw = (stage.w*16 / cam.w) | 0;
        let sh = (stage.h*16 / cam.h) | 0;

        if (dx != 0 || dy != 0) {

            cam.move(dx, dy, sw, sh, CAM_SPEED);
        }
    }


    // Hurt player
    hurt(cx, cy, ev) {

        const KNOCKBACK_X = 1.0;
        const KNOCKBACK_BASE_X = 0.5;
        const KNOCKBACK_Y = 1;

        this.hurtTimer = HURT_TIME + KNOCKBACK_TIME;

        let dirx = this.pos.x < cx ? -1 : 1;

        // Determine knockback
        this.speed.x = (this.pos.x-cx)/8.0 * KNOCKBACK_X + 
            dirx*KNOCKBACK_BASE_X;
        if (!this.canJumpOld)
            this.speed.y = (this.pos.y-cy)/8.0 * KNOCKBACK_Y;

        // Disable flags
        this.climbing = false;
        this.slideTimer = 0;
        this.shootAnimTimer = 0;
        this.canShoot = true;
        this.rocketActive = false;
        this.chargeLoadTimer = 0;

        // Play hurt sound
        ev.audio.playSample(ev.audio.sounds.hurt, 0.40);

        // Lose health
        if (this.health > 0)
            -- this.health;
    }


    // Called when the player hits the ceiling
    onCeilingHit(ev) {

        const EPS = -0.1;

        if (this.speed.y < EPS)
            ev.audio.playSample(ev.audio.sounds.hit, 0.40);
    }


    // Update death
    die(ev) {

        const FLICKER_SPEED = 4;

        this.deathTimer -= ev.step;

        // Animate death "balls"
        this.spr.animate(4, 0, 2, FLICKER_SPEED, ev.step);
    }


    // Update movement while the camera is moving
    updateCamMovement(cam, stage, ev) {

        const SPEED_MOD = 1.1;

        let speed = SPEED_MOD * 16.0 * cam.speed;

        let dx = cam.target.x - cam.pos.x;
        let dy = cam.target.y - cam.pos.y;

        this.pos.x += dx * speed * ev.step;
        this.pos.y += dy * speed * ev.step;

        this.pos.x = negMod(this.pos.x, stage.w*16);
        this.pos.y = negMod(this.pos.y, stage.h*16);
    }


    // Draw death balls (I could use the word 'orbs', but
    // gotta loves those balls while you can)
    drawDeathBalls(c) {

        const LOOP = 8;
        const RADIUS = 160;

        let px = this.pos.x | 0;
        let py = this.pos.y | 0;

        let angle = 0;
        let r = (1.0 - this.deathTimer / DEATH_TIME) * RADIUS;
        let x, y;

        for (let i = 0; i < LOOP; ++ i) {

            angle = Math.PI * 2 / LOOP * i;

            x = px + Math.cos(angle) * r;
            y = py + Math.sin(angle) * r;

            c.drawSprite(this.spr, c.bitmaps.figure,
                x-8, y-8);
        }
    }


    // Draw player to the translate coordinates
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        let px = this.pos.x | 0;
        let py = this.pos.y | 0;

        py -= (16 - this.h)/2 -1;

        // Draw dust
        for (let d of this.dust) {

            d.draw(c);
        }

        if (this.dying) {

            this.drawDeathBalls(c);
            return;
        }

        // If hurt, skip some frames
        if (this.hurtTimer > 0 && 
            this.hurtTimer < HURT_TIME &&
            Math.floor(this.hurtTimer/4) % 2 == 0)
            return;

        let row = this.spr.row;
        if (this.shootAnimTimer > 0 && !this.climbing) {

            row += 1;
        }
        else if (this.chargeLoadTimer > 0.0 &&
            Math.floor(this.chargeLoadTimer/4) % 2 == 0) {

            row += 5;
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

        c.move(-tx, -ty);
    }


    // Draw the player
    draw(c, cam, stage) {

        // If the camera is moving, draw looped
        // sprite, in the case the camera is 
        // looping
        if (cam.moving) {

            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        this.drawTranslated(c, 0, 0);
    }


    // Is the player dead
    isDead() {

        const DEATH_LIMIT = 60;

        return this.dying &&
            this.deathTimer <= DEATH_LIMIT;
    }
}
