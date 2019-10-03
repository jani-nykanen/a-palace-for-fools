import { Core } from "./engine/core.js";
import { Game } from "./game.js";
import { EnableAudioScreen } from "./audiointro.js";

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
    c.addScene(new Game(), "game", false);
    c.addScene(new EnableAudioScreen(), "audiointro", true);

    // Set assets loading
    c.assets.addBitmaps(
        {name: "font",   src: "assets/bitmaps/font.png"},
        {name: "tileset",   src: "assets/bitmaps/tileset.png"},
        {name: "clouds",   src: "assets/bitmaps/clouds.png"},
        {name: "background",   src: "assets/bitmaps/background.png"},
        {name: "figure",   src: "assets/bitmaps/figure.png"},
        {name: "gun",   src: "assets/bitmaps/gun.png"},
    );
    c.assets.addDocuments(
        {name: "sewers", src: "assets/maps/sewers.tmx"},
    );
    c.assets.addSounds(
        {name: "gas", src: "assets/audio/gas.wav"},
        {name: "shoot", src: "assets/audio/shoot.wav"},
        {name: "bulletHit", src: "assets/audio/bullet_hit.wav"},
        {name: "hit", src: "assets/audio/hit.wav"},
        {name: "jump", src: "assets/audio/jump.wav"},
        {name: "accept", src: "assets/audio/accept.wav"},
        {name: "hurt", src: "assets/audio/hurt.wav"},
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
