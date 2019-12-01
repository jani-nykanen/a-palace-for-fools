import { Stage } from "./stage.js";
import { TransitionMode } from "./engine/transition.js";
import { Camera } from "./camera.js";
import { ObjectManager } from "./objectmanager.js";
import { State } from "./engine/input.js";
import { Textbox } from "./textbox.js";
import { drawBoxWithBorders } from "./engine/util.js";
import { Menu, MenuButton } from "./menu.js";
import { GameMap } from "./map.js";

//
// Game scene
// The main gameplay happens here
// (c) 2019 Jani Nykänen
//


export class Game {


    constructor() {

        this.cloudPos = [0, 0, 0];
        this.snowTimer = [0.0, 0.0];
        this.snowFloat = [0.0, Math.PI];
        this.mapID = 0; 

        this.map = new GameMap();
    }

    
    // Show "Are you sure?"
    areYouSure(cb, ev) {

        this.textbox.addMessage(
            ev.loc.dialogue.general[3]
        );
        this.textbox.activate((ev, state) => {

            cb(ev, state);
        });
    }


    // Create the pause menu
    createPauseMenu() {

        let menu = new Menu(
            new MenuButton("Resume", (ev) => {this.pauseMenu.disable();}),
            new MenuButton("Respawn", (ev) => {

                this.areYouSure((ev, state) => {

                    if (state) {

                        this.pauseMenu.disable();
                        this.objm.killPlayer(ev);
                    }
                },ev);
            }),
            new MenuButton("Quit", (ev) => {

                ev.tr.activate(true, TransitionMode.VerticalBar,
                    2.0, (ev) => {
                        ev.changeScene("title");
                    });
            }),
        );

        return menu;
    }


    // Full reset
    fullReset(ev, assets) {

        // Set defaults
        this.mapID = 0; 
        this.textbox.active = false;

        // Create pause menu
        this.pauseMenu = this.createPauseMenu();
        // Create camera
        this.cam = new Camera(0, 0, 160, 144);
        // Create object manager
        this.objm = new ObjectManager(
            (ev, pl, col) => {

                let x = pl.pos.x % this.cam.w;
                let y = pl.pos.y % this.cam.h;

                ev.tr.setCenter(x, y);
                ev.tr.activate(true, TransitionMode.CircleOutside,
                    2, (ev) => {
                        this.changeTime();
                        // TODO: The next line should happen somewhere else
                        pl.spr.setFrame(10, 0);
                    }, ...col);
            },
            this.textbox
        );

        // Create stage
        this.stage = new Stage(this.mapID, assets, ev);
        this.stage.setGemCallback(this.objm.getGemGenerator());
        this.stage.parseObjects(this.objm, this.mapID, true);

        // Set initial camera position
        this.objm.setInitialCamera(this.cam);

        // Make sure enemies appear while the transition
        // effect is still happening
        this.objm.updateCamMovement(this.cam, null, ev);
    }


    // Initialize the scene
    // (or the things that need assets, really)
    init(ev, assets) {

        // Needed for... THE FUTURE!
        this.assets = assets;

        // Create text box
        this.textbox = new Textbox(ev);
    }


    // Reset game
    reset(id, special) {

        this.pauseMenu.disable();

        this.stage.reset(special ? this.mapID : id);
        this.objm.reset(this.cam, id);
        this.stage.parseObjects(this.objm, this.mapID, 
            special || id == null);

        // Set initial camera position
        this.objm.setInitialCamera(this.cam);
    }


    // Change time
    changeTime() {

        this.mapID = this.mapID == 1 ? 0 : 1;
        this.reset(this.mapID);
    }
    

    // Update the scene
    update(ev) {

        const CLOUD_SPEED = [1.5, 1.0, 0.5];
        const SNOW_MAX = 64;
        const SNOW_SPEED_BASE = [0.30, 0.40];
        const SNOW_SPEED_VARY = [0.20, 0.30];
        const SNOW_FLOAT_SPEED = [0.025, 0.030];

        // Update text box
        if (this.textbox.active) {

            this.textbox.update(ev);
            return;
        }

        // Update pause menu
        if (this.pauseMenu.active) {

            this.pauseMenu.update(ev);
            return;
        }

        // Update map (or actually, check input)
        if (this.map.update(this.stage, ev)) {

            return;
        }

        // Check pause button
        let p = ev.input.action.start.state;
        if (!ev.tr.active && p == State.Pressed) {

            this.pauseMenu.activate(0);
            ev.audio.playSample(ev.audio.sounds.pause,
                0.50);

            return;
        }

        // Update cloud position
        for (let i = 0; i < 3; ++ i) {

            this.cloudPos[i] += CLOUD_SPEED[i] * ev.step;
            this.cloudPos[i] %= 160;
        }

        // Update snow timer & floating
        let s;
        if (this.mapID == 1) {

            for (let i = 0; i < 2; ++ i) {

                s = SNOW_SPEED_BASE[i] + 
                    SNOW_SPEED_VARY[i] * Math.sin(this.snowFloat[i]);

                this.snowTimer[i] += s * ev.step;
                this.snowTimer[i] %= SNOW_MAX;

                this.snowFloat[i] += SNOW_FLOAT_SPEED[i] * ev.step;
                this.snowFloat[i] %= Math.PI * 2;
            }
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


    // Draw snowing
    drawSnowing(c) {

        const FLOAT_X = [16, 24];

        let w = (c.w / 64) | 0;
        let h = (c.h / 64) | 0;

        // Compute floating
        let p = 0;
        let fx = 0;
        for (let i = 0; i < 2; ++ i) {

            fx = Math.sin(this.snowFloat[i]) * FLOAT_X[i];
            p = this.snowTimer[i];

            for (let x = -1; x < w+1; ++ x) {

                for (let y = -1; y < h+1; ++ y) {

                    c.drawBitmapRegion(c.bitmaps.snow,
                        0, 64*i, 64, 64,
                        x*64 -p*i + fx, y*64 + p);
                }
            }
        }
    }


    // Draw the background
    drawBackground(c) {

        const CLOUD_POS_Y_A = 64;
        const CLOUD_OFFSET_A = 16;
        const CLOUD_POS_Y_B = 16;

        let bmp = 
            [c.bitmaps.backgroundA, c.bitmaps.backgroundB] [this.mapID];

        let clouds =
            [c.bitmaps.cloudsA, c.bitmaps.cloudsB] [this.mapID];

        c.drawBitmap(bmp, 0, 0);

        // Draw clouds
        let x;
        let end = [0, 2] [this.mapID];
        for (let i = 2; i >= end; -- i) {

            x = this.cloudPos[i] | 0;
            
            for (let j = 0; j < 2; ++ j) {

                if (this.mapID == 0) {
                c.drawBitmapRegion(clouds,  
                        0, 72*i, 160, 72,
                        -x + j*160,
                        CLOUD_POS_Y_A + CLOUD_OFFSET_A*(2-i)
                        );
                }
                else {
                
                    c.drawBitmapRegion(clouds,  
                        0, 0, 160, 96,
                        -x + j*160, CLOUD_POS_Y_B);
                }
            }
            
        }
        
        if (this.mapID == 1) {

            c.drawBitmap(c.bitmaps.forest, 0,
                    144-80);
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

        // If the screen is shaking while
        // waiting for the textbox
        this.textbox.applyShake(c);

        // Draw background
        this.drawBackground(c);

        // Move to camera
        this.cam.use(c);

        // Shake
        if (!this.cam.moving)
            c.useShake();

        // Draw map
        this.stage.draw(c, this.cam);

        // Draw game objects
        this.objm.draw(c, this.cam, this.stage);

        // Draw textbox item
        this.textbox.drawItem(c);

        // Reset camera
        c.moveTo(0, 0); 

        // Draw HUD
        this.drawHUD(c);

        // Draw snow
        if (this.mapID == 1) {

            this.drawSnowing(c);
        }

        // Draw the pause menu
        this.pauseMenu.draw(c);

        // Draw text box
        this.textbox.draw(c);

        // Draw map
        this.map.draw(c, this.stage, 
            this.cam, this.objm.getPlayer());
    }


    // On change
    onChange(ev, param) {

        let err = false;
        if (param == true){

            this.fullReset(ev, this.assets);
        }
        // Sometimes param can be null...
        else if (param == false) {

            this.fullReset(ev, this.assets);
            try {

                this.objm.parseSaveData(this.stage);
                this.mapID = this.stage.id;
                this.reset(null, true);
            }
            catch(e) {

                err = true;
                console.log(e);
            }

            if (err) {

                this.textbox.addMessage(
                    ev.loc.dialogue.savepoint[2]
                );
                this.textbox.activate();
            }
        }
    }

}
