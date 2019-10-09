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
        this.bgen = new BulletGen(16);
    }


    // Set player position
    setPlayerPosition(x, y) {

        this.player.pos.x = x*16 + 8;
        this.player.pos.y = (y+1)*16 -6;
    }


    // Update 
    update(stage, cam, ev) {

        // Update player
        this.player.update(ev, [this.bgen]);
        // Get collisions with the stage
        stage.getCollisions(this.player, ev);

        // Update bullets
        this.bgen.updateBullets(stage, cam, ev);
    }


    // Draw
    draw(c, cam, stage) {

        // Draw player
        this.player.draw(c, cam, stage);
        // Draw bullets
        this.bgen.drawBullets(c);
    }


    // Update camera movement actions
    updateCamMovement(cam, stage, ev) {

        this.player.updateCamMovement(
            cam, stage, ev);
    }


    // Is the player dead
    playerDead() {

        return this.player.isDead();
    }


    // Reset
    reset(cam) {

        this.player.respawn(cam);
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