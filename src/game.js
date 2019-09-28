//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        // ...
    }



    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        // ...
    }


    // Update the scene
    update(ev) {

        // ...
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(170);

        c.drawText(c.bitmaps.font, "HELLO WORLD!",
            2, 2, -1, 0, false);
    }

}
