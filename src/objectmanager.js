import { Player } from "./player.js";
import { Gem } from "./gem.js";
import { Generator } from "./generator.js";
import { Bullet } from "./bullet.js";
import { Portal } from "./portal.js";
import { NPC } from "./npc.js";

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


    // Update 
    update(stage, cam, ev) {

        // Update enemies
        for (let e of this.enemies) {

            e.isInCamera(cam);
            e.update(ev, [this.player, this.gemGen]);

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

        // Update NPCs
        for (let n of this.npcs) {

            n.isInCamera(cam);
            n.update(this.player, ev);
            n.playerCollision(this.player, ev);
        }

        // Update player
        this.player.update(ev, [this.bgen]);
        // Get collisions with the stage
        stage.getCollisions(this.player, ev);

        // Update bullets
        this.bgen.updateElements(stage, cam, ev);
        // Update gems
        this.gemGen.updateElements(stage, cam, ev);
        this.gemGen.playerCollision(this.player, ev);

        // Update portals
        for (let p of this.portals) {

            p.isInCamera(cam);
            p.update(ev);
            p.playerCollision(this.player, ev);
        }
    }


    // Draw
    draw(c, cam, stage) {

        // Draw portals
        for (let p of this.portals) {

            p.draw(c, stage, cam);
        }

        // Draw NPCs
        for (let n of this.npcs) {

            n.draw(c, stage, cam);
        }

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

        this.bgen.reset();
        this.gemGen.reset();

        for (let e of this.enemies) {

            e.isInCamera(cam);
        }
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

