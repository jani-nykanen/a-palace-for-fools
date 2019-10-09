import { Player } from "./player.js";
import { BulletGen } from "./bulletgen.js";

//
// Object manager. Handles the game objects,
// like player & enemies
//
// (c) 2019 Jani Nykänen
//


export class ObjectManager {


    constructor() {

        this.player = new Player(0, 0);
        this.enemies = new Array();
        this.bgen = new BulletGen(16);
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

        for (let e of this.enemies) {

            e.isInCamera(cam);
            e.update(ev, [this.player]);
            stage.getCollisions(e, ev);
        }

        // Update player
        this.player.update(ev, [this.bgen]);
        // Get collisions with the stage
        stage.getCollisions(this.player, ev);

        // Update bullets
        this.bgen.updateBullets(stage, cam, ev);
    }


    // Draw
    draw(c, cam, stage) {

        // Draw enemies
        for (let e of this.enemies) {

            e.draw(c, stage, cam);
        }

        // Draw player
        this.player.draw(c, cam, stage);
        // Draw bullets
        this.bgen.drawBullets(c);
    }


    // Update camera movement actions
    updateCamMovement(cam, stage, ev) {

        this.player.updateCamMovement(
            cam, stage, ev);

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
}

