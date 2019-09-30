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
            0.1, 0.1
        );
    }


    // Control
    control(ev) {

        this.target.x = 0;
        this.target.y = 0;

        if (ev.input.action.left.state == State.Down) {

            this.target.x = -1;
        }
        else if (ev.input.action.right.state == State.Down) {

            this.target.x = 1;
        }

        if (ev.input.action.up.state == State.Down) {

            this.target.y = -1;
        }
        else if (ev.input.action.down.state == State.Down) {

            this.target.y = 1;
        }

        this.target.normalize();
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

        // Draw a box
        for (let i = 0; i < 3; ++ i) {

            c.setColor([0, 255, 170] [i]);
            c.fillRect(px - 8 + i, py - 8 + i, 
                16 - i*2, 16 - i*2);
        }
    }
}
