import { Enemy } from "./enemy.js";

//
// Bat enemy
//
// (c) 2019 Jani Nykänen
//


export class Bat extends Enemy {


    constructor(x, y) {

        super(x, y, 0);
    }


    // Update AI
    updateAI(pl, ev) {

        // ...
    }


    // Animate
    animate(ev) {

        this.spr.animate(0, 0, 3, 6, ev.step);
    }
}
