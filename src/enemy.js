import { GameObject } from "./gameobject.js";
import { Sprite } from "./engine/sprite.js";
import { Flip } from "./engine/canvas.js";
import { Vector2 } from "./engine/vector.js";

//
// A base enemy class
//
// (c) 2019 Jani Nykänen
//


export class Enemy extends GameObject {


    constructor(x, y, id) {

        super(x, y);

        this.startPoint = this.pos.clone();
        
        this.spr = new Sprite(16, 16);
        this.spr.setFrame(id, 0);

        this.id = id;

        this.exist = true;
        this.dying = false;
        this.inCamera = false;
        this.returned = false;

        this.flip = Flip.None;
    }


    // Control, i.e AI
    control(ev, extra) {

        if (this.inCamera &&
            this.updateAI != null) {

            this.updateAI(extra[0], ev);
        }
    }


    // Check if in camera
    isInCamera(cam) {

        let px = this.pos.x;
        let py = this.pos.y;
        let w = this.spr.w/2;
        let h = this.spr.h/2;

        this.inCamera =
            px+w >= cam.top.x &&
            px-w <= cam.top.x + cam.w &&
            py+h >= cam.top.y &&
            py-h <= cam.top.y + cam.h;

        // This happens every frame for every enemy
        // if camera is not moving, so maybe some 
        // trigger for this?
        if (!this.returned &&
            !this.inCamera && !cam.moving) {

            this.pos = this.startPoint.clone();
            this.speed = new Vector2();
            this.target = new Vector2();

            if (this.reset != null)
                this.reset();

            this.returned = true;
        }

        if (this.inCamera)
            this.returned = false;
    }


    // Draw to the translated position
    drawTranslated(c, tx, ty) {

        c.move(tx, ty);

        c.drawSprite(this.spr, c.bitmaps.enemy,
            (this.pos.x-8) | 0,
            (this.pos.y-8) | 0,
            this.flip);

        c.move(-tx, -ty);
    }


    // Draw
    draw(c, stage, cam) {

        if (!this.exist) return;

        if (cam.moving) {

            // Okay, we do some unnecessary drawing here
            // Maybe extra camera checks were necessary?
            if (cam.dir.x > 0)
                this.drawTranslated(c, -stage.w*16, 0);
            else if (cam.dir.x < 0)
                this.drawTranslated(c, stage.w*16, 0);
        }

        if (this.inCamera)
            this.drawTranslated(c, 0, 0);
    }
}
