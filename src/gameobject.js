import { Vector2 } from "./engine/vector.js";
import { updateSpeedAxis } from "./engine/util.js";

//
// A game object. Can take collisions.
//
// (c) 2019 Jani Nykänen
//


export class GameObject {


    constructor(x, y) {

        this.pos = new Vector2(x, y);
        this.oldPos = this.pos.clone();
        this.speed = new Vector2(0, 0);
        this.target = new Vector2(0, 0);
        this.acc = new Vector2(1, 1);

        this.w = 16;
        this.h = 16;

        this.canJump = false;
        this.jumpTimer = 0.0;

        this.touchLadder = false;
        this.ladderX = 0;
        this.climbing = false;

        this.touchWater = false;
    }


    // Update movement
    move(ev) {

        // Store old position
        this.oldPos = this.pos.clone();

        // Update speed axes
        this.speed.x = updateSpeedAxis(this.speed.x, 
            this.target.x, this.acc.x * ev.step);
        this.speed.y = updateSpeedAxis(this.speed.y, 
            this.target.y, this.acc.y * ev.step);

        // Update position
        this.pos.x += this.speed.x * ev.step;
        this.pos.y += this.speed.y * ev.step;
    }


    // Update game object
    update(ev) {

        // This is possibly faster than testing
        // if 'control' is a function
        if (this.control != null) {

            this.control(ev);
        }
        this.move(ev);

        if (this.animate != null) {

            this.animate(ev);
        }

        this.canJump = false;
        this.touchLadder = false;
        this.touchWater = false;
    }   


    // Ladder collision
    ladderCollision(x, y, w, h) {

        let px = this.pos.x;
        let py = this.pos.y;

        let pw = this.w;
        let ph = this.h;

        let touch = 
            px+pw/2 > x &&
            px-pw/2 < x+w &&
            py+ph/2 > y &&
            py-ph/2 < y+h;

        this.touchLadder |= touch;

        if (touch)
            this.ladderX = x;
    }


    // Water collision
    waterCollision(x, y, w, h) {

        let px = this.pos.x;
        let py = this.pos.y;

        let pw = this.w;
        let ph = this.h;

        this.touchWater |= 
            px+pw/2 > x &&
            px-pw/2 < x+w &&
            py+ph/2 > y &&
            py-ph/2 < y+h;
    }


    // Horizontal collision
    horizontalCollision(x, y, d, dir) {

        let px = this.pos.x;
        let py = this.pos.y;
        let opy = this.oldPos.y;

        let w = this.w;
        let h = this.h;

        // If not in the horizontal area,
        // stop here
        if (px+w/2 <= x || px-w/2 >= x+d) 
            return false;

        // Check collision from above
        if ((!dir || dir > 0) &&
            this.speed.y > 0.0 &&
            py+h/2 >= y-this.speed.y && 
            opy+h/2 < y+this.speed.y) {

            this.pos.y = y - h/2;
            this.speed.y = 0;
            this.canJump = true;

            return true;

        }

        // Check collision from below
        if ((!dir || dir < 0) &&
            this.speed.y < 0.0 &&
            py-h/2 <= y-this.speed.y && 
            opy-h/2 > y+this.speed.y) {

            this.pos.y = y + h/2;
            this.speed.y = 0;
            this.jumpTimer = 0.0;

            return true;
        }

        return false;
    }


    // Vertical collision
    // TODO: One could merge this one and the previous
    // one to a more general method. The code is 99%
    // the same.
    verticalCollision(x, y, d) {

        // With this we avoid the case the object
        // is taking the wall collision before floor
        // collision, and thus getting stuck
        const MARGIN = 1;

        let px = this.pos.x;
        let py = this.pos.y;
        let opx = this.oldPos.x;

        let w = this.w;
        let h = this.h;

        // If not in the horizontal area,
        // stop here
        if (py+h/2 <= y+MARGIN || py-h/2 >= y+d-MARGIN) 
            return false;

        // Check collision from above
        if (this.speed.x > 0.0 &&
            px+w/2 >= x-this.speed.x && 
            opx+w/2 < x+this.speed.x) {

            this.pos.x = x - w/2;
            this.speed.x = 0;

            return true;
        }

        // Check collision from right
        if (this.speed.x < 0.0 &&
            px-w/2 <= x-this.speed.x && 
            opx-w/2 > x+this.speed.x) {

            this.pos.x = x + w/2;
            this.speed.x = 0;

            return true;
        }

        return false;
    }

}
