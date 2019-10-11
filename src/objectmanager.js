import { Player } from "./player.js";
import { Gem } from "./gem.js";
import { Generator } from "./generator.js";
import { Bullet } from "./bullet.js";

//
// Object manager. Handles the game objects,
// like player & enemies
//
// (c) 2019 Jani Nykänen
//


export class ObjectManager {


    constructor() {

        const GEM_COUNT = 8;
        const BULLET_COUNT = 16;

        this.player = new Player(0, 0);
        this.enemies = new Array();
        this.bgen = new Generator(Bullet.prototype, BULLET_COUNT);
        this.gemGen = new Generator(Gem.prototype, GEM_COUNT);
    }


    // Set player position
    setPlayerPosition(x, y) {

        this.player.pos.x = x*16 + 8;
        this.player.pos.y = (y+1)*16 -6;
    }


    // Add an enemy
    addEnemy(enemy) {

        this.enemies.push(enemy);
    }


    // Update 
    update(stage, cam, ev) {

        // Update enemies
        for (let e of this.enemies) {

            e.isInCamera(cam);
            e.update(ev, [this.player, this.gemGen]);
            stage.getCollisions(e, ev);

            // Bullet collision
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
    }


    // Draw
    draw(c, cam, stage) {

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
    updateCamMovement(cam, stage, ev) {

        // Make the player move if the camera
        // is moving, too
        this.player.updateCamMovement(
            cam, stage, ev);

        // Check if other objects outside
        // the camera area
        for (let e of this.enemies) {

            e.isInCamera(cam);
        }
    }


    // Is the player dead
    playerDead() {

        return this.player.isDead();
    }


    // Reset
    reset(cam) {

        this.player.respawn(cam);
        this.enemies = new Array();

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
}

