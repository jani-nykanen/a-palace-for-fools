import { State } from "./engine/input.js";

//
// A textbox
//
// (c) 2019 Jani Nykänen
//


export class Textbox {


    constructor(w, h) {

        this.queue = new Array();

        this.char = 0;
        this.charTimer = 0;
        this.charPos = 0;
        this.active = false;

        this.endSymbolFloat = 0.0;

        this.w = w;
        this.h = h;
    }


    // Add messages
    addMessage() {

        for (let a of arguments) {

            this.queue.push(a);
        }
    }

    
    // Activate
    activate() {

        this.active = true;
        this.charTimer = 0;
        this.charPos = 0;
        this.queuePos = 0;
    }


    // Update
    update(ev) {

        const FLOAT_SPEED = 0.1;
        const CHAR_WAIT = 2;

        if (!this.active) return;

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


    // Draw
    draw(c) {

        const CORNER_OFF = 2;
        const TEXT_OFF_X = 0;
        const TEXT_OFF_Y = 2;
        const COLORS = [255, 0, 85];
        const END_FLOAT = 1.1;

        if (!this.active) return;

        let tx = c.w/2 - this.w/2;
        let ty = c.h/2 - this.h/2;

        for (let i = 2; i >= 0; -- i) {


            c.setColor(COLORS[2-i]);
            c.fillRect(tx-i, ty-i,
                this.w+i*2, this.h+i*2);
        }

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
                tx + this.w - 8, 
                ty + this.h - 8 + y);
        }
    }

}
