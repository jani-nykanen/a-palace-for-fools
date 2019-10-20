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
        {name: "tilesetA",   src: "assets/bitmaps/tileset.png"},
        {name: "tilesetB",   src: "assets/bitmaps/tileset_b.png"},
        {name: "cloudsA",   src: "assets/bitmaps/clouds.png"},
        {name: "cloudsB",   src: "assets/bitmaps/clouds_b.png"},
        {name: "backgroundA",   src: "assets/bitmaps/background.png"},
        {name: "backgroundB",   src: "assets/bitmaps/background_b.png"},
        {name: "figure",   src: "assets/bitmaps/figure.png"},
        {name: "gun",   src: "assets/bitmaps/gun.png"},
        {name: "hud",   src: "assets/bitmaps/hud.png"},
        {name: "bullet",   src: "assets/bitmaps/bullet.png"},
        {name: "dustA",   src: "assets/bitmaps/dust.png"},
        {name: "dustB",   src: "assets/bitmaps/dust_b.png"},
        {name: "enemy",   src: "assets/bitmaps/enemies.png"},
        {name: "gem",   src: "assets/bitmaps/gem.png"},
        {name: "forest",   src: "assets/bitmaps/forest.png"},
        {name: "snow",   src: "assets/bitmaps/snow.png"},
        {name: "door",   src: "assets/bitmaps/door.png"},
    );
    c.assets.addDocuments(
        {name: "past", src: "assets/maps/past.tmx"},
        {name: "present", src: "assets/maps/present.tmx"},
    );
    c.assets.addSounds(
        {name: "gas", src: "assets/audio/gas.wav"},
        {name: "shoot", src: "assets/audio/shoot.wav"},
        {name: "bulletHit", src: "assets/audio/bullet_hit.wav"},
        {name: "hit", src: "assets/audio/hit.wav"},
        {name: "jump", src: "assets/audio/jump.wav"},
        {name: "accept", src: "assets/audio/accept.wav"},
        {name: "hurt", src: "assets/audio/hurt.wav"},
        {name: "slide", src: "assets/audio/slide.wav"},
        {name: "climb", src: "assets/audio/climb.wav"},
        {name: "die", src: "assets/audio/die.wav"},
        {name: "charge", src: "assets/audio/charge.wav"},
        {name: "shootBig", src: "assets/audio/shoot_big.wav"},
        {name: "gem", src: "assets/audio/gem.wav"},
        {name: "breakWall", src: "assets/audio/break.wav"},
        {name: "life", src: "assets/audio/life.wav"},
        {name: "teleport", src: "assets/audio/teleport.wav"},
        {name: "quake", src: "assets/audio/quake.wav"},
        {name: "kill", src: "assets/audio/kill.wav"},
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

        {name: "debug", key: 80},
    )

    c.run();
}
