import { State } from "./engine/input.js";
import { Vector2 } from "./engine/vector.js";
import { drawBoxWithBorders } from "./engine/util.js";

//
// A textbox
//
// (c) 2019 Jani Nykänen
//


export class Textbox {


    constructor() {

        this.queue = new Array();
        this.sizes = new Array();

        this.char = 0;
        this.charTimer = 0;
        this.charPos = 0;
        this.active = false;

        this.endSymbolFloat = 0.0;

        this.waitTimer = 0;
        this.itemWait = 0;
        this.itemPos = new Vector2();
        this.item = null;
        this.itemSpeed = 0;
    }


    // Compute size for a textbox
    computeSize(msg) {

        const WIDTH_MUL = 8;
        const HEIGHT_MUL = 10;

        let r = new Vector2();

        let lines = msg.split('\n');

        r.x = Math.max(...(lines.map(lines => lines.length))) * WIDTH_MUL;
        r.y = lines.length * HEIGHT_MUL;

        return r;
    }


    // Add messages
    addMessage() {

        for (let a of arguments) {

            this.queue.push(a);
            this.sizes.push(this.computeSize(a));
        }
    }

    
    // Activate
    activate(wait, item, itemPos, speedY, itemWait) {

        this.active = true;
        this.charTimer = 0;
        this.charPos = 0;
        this.queuePos = 0;

        if (wait == null)
            wait = 0.0;
        this.waitTimer = wait;

        this.item = item;
        if (item != null) {

            this.itemPos = itemPos.clone();
            this.itemSpeed = speedY;
            this.itemWait = itemWait;
        }
    }


    // Update
    update(ev) {

        const FLOAT_SPEED = 0.1;
        const CHAR_WAIT = 2;

        if (!this.active) return;

        // Update wait timer
        if (this.waitTimer > 0) {

            // Compute item pos
            if (this.item != null) {

                if (this.itemWait > 0) {

                    this.itemPos.y += this.itemSpeed * ev.step;
                    this.itemWait -= 1.0 * ev.step;
                }
            }

            this.waitTimer -= 1.0 * ev.step;
            return;
        }

        let action = ev.input.anyPressed;
            //ev.input.action.start.state == State.Pressed ||
            //ev.input.action.fire1.state == State.Pressed;
        let c;

        // Update character timer
        if (this.charPos < this.queue[0].length) {

            if (action) {

                this.charPos = this.queue[0].length;
            }
            else {

                if ((this.charTimer += 1.0 * ev.step) >= CHAR_WAIT) {

                    this.charTimer -= CHAR_WAIT;
                    ++ this.charPos;

                    c = this.queue[0].charCodeAt(this.charPos);
                    if (this.charPos < this.queue[0].length && 
                        c == '\n') {

                        ++ this.charPos;
                    }
                }
            }
        }
        else {

            // Wait for input
            if (action) {

                this.queue.shift();
                this.sizes.shift();

                this.charPos = 0;
                this.charTimer = 0;

                ev.audio.playSample(ev.audio.sounds.next, 0.60);

                if (this.queue.length == 0) {

                    this.active = false;
                }
            }

            // Update end symbol floating
            this.endSymbolFloat = 
                (this.endSymbolFloat + FLOAT_SPEED*ev.step) % 
                (Math.PI*2);
        }
    }


    // Draw item
    drawItem(c) {

        if (!this.active ||
            this.item == null) return;

        c.drawBitmapRegion(c.bitmaps.items,
            this.item*16, 0, 16, 16,
            (this.itemPos.x - 8) | 0,
            (this.itemPos.y - 8) | 0);
    }


    // Draw
    draw(c) {

        const CORNER_OFF = 2;
        const TEXT_OFF_X = 0;
        const TEXT_OFF_Y = 2;
        const COLORS = [255, 0, 85];
        const END_FLOAT = 1.1;

        if (!this.active ||
            this.waitTimer > 0) return;

        let w = this.sizes[0].x + CORNER_OFF*2;
        let h = this.sizes[0].y + CORNER_OFF*2;

        let tx = c.w/2 - w/2;
        let ty = c.h/2 - h/2;

        drawBoxWithBorders(c, tx, ty, w, h, COLORS);

        // Draw current message
        c.drawText(c.bitmaps.font, 
            this.queue[0].substr(0, this.charPos),
            tx + CORNER_OFF, ty + CORNER_OFF,
            TEXT_OFF_X, TEXT_OFF_Y);

        // Draw finish symbol
        let y;
        if (this.charPos == this.queue[0].length) {

            y = Math.floor(Math.sin(this.endSymbolFloat) * END_FLOAT) | 0;
            c.drawBitmapRegion(
                c.bitmaps.font, 
                24, 0, 8, 8,
                tx + w - 8, 
                ty + h - 8 + y);
        }
    }

}
