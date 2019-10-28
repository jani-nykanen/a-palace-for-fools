import { Player } from "./player.js";
import { Gem } from "./gem.js";
import { Generator } from "./generator.js";
import { Bullet } from "./bullet.js";
import { Portal } from "./portal.js";
import { NPC } from "./npc.js";
import { Chest } from "./chest.js";

//
// Object manager. Handles the game objects,
// like player & enemies
//
// (c) 2019 Jani Nykänen
//


export class ObjectManager {


    constructor(portalCB, textbox) {

        const GEM_COUNT = 8;
        const BULLET_COUNT = 16;

        this.player = new Player(0, 0);
        this.enemies = new Array();
        this.portals = new Array();
        this.npcs = new Array();
        this.chests = new Array();

        this.playerCreated = false;

        this.bgen = new Generator(Bullet.prototype, BULLET_COUNT);
        this.gemGen = new Generator(Gem.prototype, GEM_COUNT);

        this.portalCB = portalCB;
        this.textbox = textbox;
    }


    // Get gem generator
    getGemGenerator() {

        return this.gemGen;
    }


    // Set player position
    setPlayerPosition(x, y, respawn) {

        // If not respawning, set player pose
        if (!respawn)  {

            this.player.setPortalPose(false);
            return;
        }

        if (this.playerCreated) {

            return;
        }
        this.playerCreated = true;

        // TODO: setPos for player?
        this.player.pos.x = x*16 + 8;
        this.player.pos.y = (y+1)*16 -6;

        this.player.checkpoint = this.player.pos.clone();

        
    }


    // Add an enemy
    addEnemy(type, x, y) {

        this.enemies.push(new type.constructor(x, y));
    }


    // Add a portal
    addPortal(x, y, id) {

        this.portals.push(
            new Portal(x*16 + 8, y*16, id, this.portalCB)
        );
    }


    // Add an NPC
    addNPC(x, y, id) {

        this.npcs.push(
            new NPC(x*16 + 8, y*16 + 8, id, this.textbox)
        );
    }


    // Add a chest
    addChest(x, y, id, makeActive) {

        this.chests.push(
            new Chest(x*16 + 8, y*16 + 8, id, 
                this.textbox, makeActive)
        );
    }


    // Update an array of "rendered objects"
    updateRenderedObjectArray(arr, stage, cam, ev) {
        
        for (let n of arr) {

            n.isInCamera(cam, ev, false);
            n.update(this.player, ev);
            n.playerCollision(this.player, stage, ev);
        }
    }


    // Update 
    update(stage, cam, ev) {

        // Update enemies
        for (let e of this.enemies) {

            e.isInCamera(cam);
            e.update(ev, [this.player, this.gemGen, this.bgen]);

            // Collisions
            if (e.exist) {

                for (let b of this.bgen.elements) {

                    e.bulletCollision(b, ev);
                }

                // Enemy-to-enemy collision
                for (let e2 of this.enemies) {

                    if (e2 == e) continue;

                    e.enemyToEnemyCollision(e2);
                }
            }
            stage.getCollisions(e, ev);
            
        }

        // Update player
        this.player.update(ev, [this.bgen]);
        for (let b of this.bgen.elements) {

            this.player.bulletCollision(b, ev);
        }
        // Get collisions with the stage
        stage.getCollisions(this.player, ev);

        // Update bullets
        this.bgen.updateElements(stage, cam, ev);
        // Update gems
        this.gemGen.updateElements(stage, cam, ev);
        this.gemGen.playerCollision(this.player, ev);

        // Update chests
        this.updateRenderedObjectArray(this.chests, stage, cam, ev);
        // Update NPCs
        this.updateRenderedObjectArray(this.npcs, stage, cam, ev);
        // Update portals
        this.updateRenderedObjectArray(this.portals, stage, cam, ev);
    }
    


    // Draw an array of "rendered objects"
    drawRenderedObjectArray(o, c, stage, cam) {

        for (let n of o) {

            n.draw(c, stage, cam);
        }
    }



    // Draw
    draw(c, cam, stage) {

        // Draw portals
        this.drawRenderedObjectArray(this.portals, c, stage, cam);
        // Draw NPCs
        this.drawRenderedObjectArray(this.npcs, c, stage, cam);
        // Draw chests
        this.drawRenderedObjectArray(this.chests, c, stage, cam);

        // "Pre-render" specific enemy parts
        for (let e of this.enemies) {

            if (e.preRender != null) {

                e.preRenderAll(c, stage, cam);
            }
        }

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c, stage, cam);
        }

        // Draw player
        this.player.draw(c, cam, stage);
        // Draw gems
        this.gemGen.drawElements(c);
        // Draw bullets
        this.bgen.drawElements(c);
    }


    // Update camera movement actions
    // TODO: Rename this
    updateCamMovement(cam, stage, ev) {

        // If teleporting, animate player teleporting
        // animation
        this.player.animateTeleporting(ev);

        if (stage != null) {
            
            // Make the player move if the camera
            // is moving, too
            this.player.updateCamMovement(
                cam, stage, ev);
        }

        // Check if other objects outside
        // the camera area
        for (let e of this.enemies) {

            e.isInCamera(cam);
        }
        for (let p of this.portals) {

            p.isInCamera(cam, ev, true);
        }
        for (let n of this.npcs) {

            n.isInCamera(cam);
        }
        for (let c of this.chests) {

            c.isInCamera(cam);
        }
    }


    // Is the player dead
    playerDead() {

        return this.player.isDead();
    }

    // Reset
    reset(cam, id) {

        if (id == null)
            this.player.respawn(cam);

        // this.player.setRespawnPose();

        this.portals = new Array();
        this.enemies = new Array();
        this.npcs = new Array();
        this.chests = new Array();

        this.bgen.reset();
        this.gemGen.reset();
    }


    // Check death
    checkDeath(ev) {

        if (this.player.dying) {

            this.player.die(ev);
        }
    }


    // Update camera
    updateCamera(cam, stage, ev) {

        // Update camera
        this.player.updateCamera(cam, stage, ev);
    }


    // Get gem count
    getGemCount() {

        return this.player.gems;
    }


    // Get player health
    getPlayerHealth() {

        return this.player.health;
    }


    // Get player max health
    getPlayerMaxHealth() {

        return this.player.maxHealth;
    }


    // Set initial camera position
    setInitialCamera(cam) {

        cam.pos.x = (this.player.pos.x / cam.w) | 0;
        cam.pos.y = (this.player.pos.y / cam.h) | 0;

        cam.update(null);
    }
}

