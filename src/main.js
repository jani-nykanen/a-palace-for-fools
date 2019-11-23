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

    // Set language to english
    c.setLocalization("en");

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
        {name: "npc",   src: "assets/bitmaps/npc.png"},
        {name: "items",   src: "assets/bitmaps/items.png"},
        {name: "decorations",   src: "assets/bitmaps/decorations.png"},
        {name: "propeller",   src: "assets/bitmaps/propeller.png"},
        {name: "savepoint",   src: "assets/bitmaps/savepoint.png"},
    );
    c.assets.addDocuments(
        {name: "past", src: "assets/maps/past.tmx"},
        {name: "present", src: "assets/maps/present.tmx"},
        {name: "en", src: "localization/en.xml"},
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
        {name: "next", src: "assets/audio/next.wav"},
        {name: "pause", src: "assets/audio/pause.wav"},
        {name: "deny", src: "assets/audio/deny.wav"},
        {name: "checkpoint", src: "assets/audio/checkpoint.wav"},

        {name: "item", src: "assets/audio/item.ogg"},
        {name: "healthUp", src: "assets/audio/health_up.ogg"},
    );

    // Configure keys
    c.configActions(
        {name: "left", key: 37, axis: 0, dir: -1, button: 14},
        {name: "up", key: 38, axis: 1, dir: -1, button: 12},
        {name: "right", key: 39, axis: 0, dir: 1, button: 15},
        {name: "down", key: 40, axis: 1, dir: 1, button: 13},

        {name: "fire1", key: 90, button: 0},
        {name: "fire2", key: 88, button: 2},

        {name: "start", key: 13, button: 9},
        {name: "back", key: 27, button: 8},

        {name: "debug", key: 80},
    )

    c.run();
}
