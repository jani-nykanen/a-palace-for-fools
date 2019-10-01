import { Stage } from "./stage.js";
import { Vector2 } from "./engine/vector.js";
import { Player } from "./player.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        // No reason to make a class for this
        this.cam = {
            x: 0, y: 0,
            w: 160, h: 144
        };
        this.player = new Player(80, 72);

        this.cloudPos = [0, 0, 0];
    }



    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        this.stage = new Stage(ev.documents.sewers);
    }


    // Update the scene
    update(ev) {

        const CLOUD_SPEED = [1.5, 1.0, 0.5];

        // Update player
        this.player.update(ev);
        // Get collisions with the stage
        this.stage.getCollisions(this.player);

        // Update camera
        this.player.updateCamera(this.cam, this.stage);

        // Update stage
        this.stage.update(ev);

        // Update cloud position
        for (let i = 0; i < 3; ++ i) {

            this.cloudPos[i] += CLOUD_SPEED[i] * ev.step;
            this.cloudPos[i] %= 160;
        }
    }


    // Draw the background
    drawBackground(c) {

        c.drawBitmap(c.bitmaps.background, 0, 0);

        // Draw clouds
        let x;
        for (let i = 2; i >= 0; -- i) {

            x = this.cloudPos[i] | 0;
            for (let j = 0; j < 2; ++ j) {

                c.drawBitmapRegion(c.bitmaps.clouds,  
                    0, 72*i, 160, 72,
                    -x + j*160,
                    64 + 16*(2-i)
                    );
            }
        }
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(85);

        // Draw background
        this.drawBackground(c);

        // Move to camera
        c.moveTo(-(this.cam.x*160) | 0, 
                 -(this.cam.y*144) | 0);

        // Draw map
        this.stage.draw(c, this.cam.x, this.cam.y);

        // Draw player
        this.player.draw(c);

        // Reset camera
        c.moveTo(0, 0); 
    }

}
