import { Vector2 } from "./engine/vector.js";
import { State } from "./engine/input.js";

//
// An object that is rendered
//
// (c) 2019 Jani Nykänen
//


export class RenderedObject {


    // Currently not used
    constructor(x, y) {

        this.pos = new Vector2(x, y);

        this.active = true;
        this.inCamera = false;
        this.w = 0;
        this.h = 0;
    }


    // Check the collision with the player
    playerCollision(pl, ev) {

        if (this.activate == null ||
            !this.inCamera || !this.active || 
            !pl.canJump || pl.dying) return;
    
        // Check if inside the collision area
        let px = pl.pos.x;
        let py = pl.pos.y;

        let pw = pl.w;
        let ph = pl.h;

        let tx = this.pos.x - this.w/2;
        let ty = this.pos.y - this.h/2;

        // Call activation event, if inside
        // the collision area
        if (px+pw > tx &&
            px-pw < tx+this.w &&
            py+ph/2 > ty &&
            py-ph/2 < ty+this.h) {

            pl.showArrow = true;

            if (ev.input.action.up.state == State.Pressed)
                this.activate(pl, ev);
        }
    }


    // Draw
    draw(c, stage, cam) {

        if (this.drawTranslated == null) return;

        if (cam.moving) {

            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        if (this.inCamera);
            this.drawTranslated(c, 0, 0);
    }
}
