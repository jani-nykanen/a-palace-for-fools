import { Stage } from "./stage.js";
import { Vector2 } from "./engine/vector.js";
import { Player } from "./player.js";
import { BulletGen } from "./bulletgen.js";
import { TransitionMode } from "./engine/transition.js";
import { Camera } from "./camera.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        this.cam = new Camera(0, 0, 160, 144);
        this.player = new Player(56, 58);
        this.bgen = new BulletGen(16);

        this.cloudPos = [0, 0, 0];
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        this.stage = new Stage(ev.documents.sewers);
    }


    // Reset game
    reset() {

        this.player.respawn(this.cam);
    }


    // Update the scene
    update(ev) {

        const CLOUD_SPEED = [1.5, 1.0, 0.5];

        // Update cloud position
        for (let i = 0; i < 3; ++ i) {

            this.cloudPos[i] += CLOUD_SPEED[i] * ev.step;
            this.cloudPos[i] %= 160;
        }

        if (ev.tr.active) {
            
            if (this.player.dying) {

                this.player.die(ev);
            }
            return;
        }

        // Update camera
        if (this.cam.update(ev)) {

            this.player.updateCamMovement(
                this.cam, this.stage, ev);
            return;
        }

        // Update player
        this.player.update(ev, [this.bgen]);
        // Get collisions with the stage
        this.stage.getCollisions(this.player, ev);

        // Check if the player is dead
        if (this.player.isDead()) {

            ev.tr.activate(true, TransitionMode.VerticalBar, 2.0,
                () => {
                    this.reset();
                });
        }

        // Update bullets
        this.bgen.updateBullets(this.stage, this.cam, ev);

        // Update camera
        this.player.updateCamera(this.cam, this.stage, ev);

        // Update stage
        this.stage.update(ev);
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


    // Draw HUD
    drawHUD(c) {

        const HEART_X = -2;
        const HEART_Y = -2;

        const LIFE_BAR_X = 12;

        c.drawBitmapRegion(c.bitmaps.hud,
            0, 0, 16, 16,
            HEART_X, HEART_Y);

        // Draw health
        let sx;
        for (let i = 0; i < this.player.maxHealth; ++ i) {

            sx = 17;
            if (this.player.health <= i)
                sx += 8;

            c.drawBitmapRegion(c.bitmaps.hud,
                sx, 0, 6, 16,
                LIFE_BAR_X + i * 5, HEART_Y);
        }
    }


    // (Re)draw the scene
    draw(c) {

        c.clear(85);

        // Draw background
        this.drawBackground(c);

        // Move to camera
        this.cam.use(c);

        // Draw map
        this.stage.draw(c, this.cam);

        // Draw player
        this.player.draw(c, this.cam, this.stage);

        // Draw bullets
        this.bgen.drawBullets(c);

        // Reset camera
        c.moveTo(0, 0); 

        // Draw HUD
        this.drawHUD(c);
    }

}
