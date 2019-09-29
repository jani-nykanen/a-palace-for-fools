import { Stage } from "./stage.js";
import { Vector2 } from "./engine/vector.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        this.cam = new Vector2(0, 0);
    }



    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        this.stage = new Stage(ev.documents.sewers);
    }


    // Update the scene
    update(ev) {

        // ...
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(85);

        // Move to camera
        c.moveTo((this.cam.x*160) | 0, 
                 (this.cam.y*144) | 0);

        // Draw map
        this.stage.draw(c, this.cam.x, this.cam.y);

        // Reset camera
        c.moveTo(0, 0); 

        c.drawText(c.bitmaps.font, "HELLO WORLD!",
            2, 2, -1, 0, false);
    }

}
