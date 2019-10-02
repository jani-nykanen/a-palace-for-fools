import { Bullet } from "./bullet.js";

//
// A bullet generator (or manager)
//
// (c) 2019 Jani Nykänen
//


export class BulletGen {


    constructor(count) {

        this.bullets = new Array(count);
        for (let i = 0; i < count; ++ i) {

            this.bullets[i] = new Bullet(0, 0);
        }
    }


    // Create a bullet
    createBullet(x, y, sx, sy) {

        // Find a bullet that does not exist
        // and spawn it
        let b = null;
        for (let bl of this.bullets) {

            if (!bl.exist) {

                b = bl;
                break;
            }
        }
        if (b == null) return null;

        b.spawn(x, y, sx, sy);

        return b;
    }


    // Update bullets
    updateBullets(stage, cam, ev) {

        for (let b of this.bullets) {

            // The order is important, this way
            // we prevent bullets going through
            // walls
            stage.getCollisions(b);
            b.update(ev, [cam]);
            
        }
    }


    // Draw bullets
    drawBullets(c) {

        for (let b of this.bullets) {

            b.draw(c);
        }
    }
} 