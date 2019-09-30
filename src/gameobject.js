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
        this.speed = new Vector2(0, 0);
        this.target = new Vector2(0, 0);
        this.acc = new Vector2(1, 1);

        this.canJump = false;
    }


    // Update movement
    move(ev) {

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
    }   

}
