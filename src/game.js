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
    }



    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        this.stage = new Stage(ev.documents.sewers);
    }


    // Update the scene
    update(ev) {

        // Update player
        this.player.update(ev);

        // Update camera
        this.player.updateCamera(this.cam, this.stage);
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(85);

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
