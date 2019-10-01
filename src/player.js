import { GameObject } from "./gameobject.js";
import { Vector2 } from "./engine/vector.js";
import { State } from "./engine/input.js";
import { negMod } from "./engine/util.js";

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

        // Moving up and down
        if (ev.input.action.up.state == State.Down) {

            this.target.y = -CLIMB_SPEED;
        }
        else if (ev.input.action.down.state == State.Down) {

            this.target.y = CLIMB_SPEED;
        }

        if (!this.touchLadder)
            this.climbing = false;
    }


    // Control
    control(ev) {

        const GRAVITY = 2.0;
        const WATER_GRAVITY = 0.5;
        const H_SPEED = 1.0;
        const JUMP_TIME = 15;
        const SWIM_SPEED_UP = -1.5;

        this.target.x = 0;
        this.target.y = 
            this.touchWater ? WATER_GRAVITY :  GRAVITY;

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

                else if( this.canJump && this.jumpTimer <= 0.0)
                    this.jumpTimer = JUMP_TIME;
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

        // ...
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

        // Draw a box
        for (let i = 0; i < 3; ++ i) {

            c.setColor([0, 255, 170] [i]);
            c.fillRect(px - 8 + i, py - 8 + i, 
                16 - i*2, 16 - i*2);
        }
    }
}
