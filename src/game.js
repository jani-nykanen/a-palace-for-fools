import { Stage } from "./stage.js";
import { TransitionMode } from "./engine/transition.js";
import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        this.cam = new Camera(0, 0, 160, 144);
        this.objm = new ObjectManager();

        this.cloudPos = [0, 0, 0];
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev) {

        this.stage = new Stage(ev.documents.sewers);
        this.stage.setGemCallback(this.objm.getGemGenerator());
        this.stage.parseObjects(this.objm);
    }


    // Reset game
    reset() {

        this.stage.reset();
        this.objm.reset(this.cam);
        this.stage.parseObjects(this.objm);
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
            
            // To make sure all the required objects all
            // drawn
            this.objm.updateCamMovement(this.cam, this.stage, ev);

            // I don't remember what this does
            this.objm.checkDeath(ev);
            return;
        }

        // Update camera
        if (this.cam.update(ev)) {

            this.objm.updateCamMovement(
                this.cam, this.stage, ev);
            return;
        }

        // Update player
        this.objm.update(this.stage, this.cam, ev);

        // Check if the player is dead
        if (this.objm.playerDead()) {

            ev.tr.activate(true, TransitionMode.VerticalBar, 2.0,
                () => {
                    this.reset();
                });
        }

        // Update camera
        this.objm.updateCamera(this.cam, this.stage, ev);

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

        const GEM_OFF = 2;
        const TEXT_X_OFF = 1;

        c.drawBitmapRegion(c.bitmaps.hud,
            0, 0, 16, 16,
            HEART_X, HEART_Y);

        // Draw health
        let sx;
        for (let i = 0; i < this.objm.getPlayerMaxHealth(); ++ i) {

            sx = 17;
            if (this.objm.getPlayerHealth() <= i)
                sx += 8;

            c.drawBitmapRegion(c.bitmaps.hud,
                sx, 0, 6, 16,
                LIFE_BAR_X + i * 5, HEART_Y);
        }

        // Draw gems
        let gemStr = String.fromCharCode(2) +
                     String(this.objm.getGemCount()) ;
        let len = gemStr.length * (8+TEXT_X_OFF);

        let gemX = c.w - len - 16;

        c.drawText(c.bitmaps.font, gemStr, 
            c.w-len-GEM_OFF, GEM_OFF, TEXT_X_OFF, 0, false);

        c.drawBitmapRegion(c.bitmaps.hud,
            0, 16, 16, 16,
            gemX, -GEM_OFF);
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

        // Draw game objects
        this.objm.draw(c, this.cam, this.stage);

        // Reset camera
        c.moveTo(0, 0); 

        // Draw HUD
        this.drawHUD(c);
    }

}
