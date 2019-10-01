import { Core } from "./engine/core.js";
import { Game } from "./game.js";

//
// Main file
// (c) 2019 Jani Nykänen
//


window.onload = () => {

    let c = new Core({
        canvasWidth: 160,
        canvasHeight: 144,
        frameRate: 60,
    });

    // Add scenes
    c.addScenes(new Game());

    // Set assets loading
    c.assets.addBitmaps(
        {name: "font",   src: "assets/bitmaps/font.png"},
        {name: "tileset",   src: "assets/bitmaps/tileset.png"},
        {name: "clouds",   src: "assets/bitmaps/clouds.png"},
        {name: "background",   src: "assets/bitmaps/background.png"},
    );
    c.assets.addDocuments(
        {name: "sewers", src: "assets/maps/sewers.tmx"},
    );

    // Configure keys
    c.configActions(
        {name: "left", key: 37},
        {name: "up", key: 38},
        {name: "right", key: 39},
        {name: "down", key: 40},

        {name: "fire1", key: 90},
        {name: "fire2", key: 88},

        {name: "start", key: 13},
        {name: "back", key: 27},
    )

    c.run();
}
