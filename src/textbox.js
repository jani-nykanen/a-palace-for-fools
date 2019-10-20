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

        const CHAR_WAIT = 4;

        if (!this.active) return;

        let action = ev.input.action.start.state == State.Pressed ||
            ev.input.action.fire1.state == State.Pressed;

        // Update character timer
        if (this.charPos < this.queue[0].length) {

            if (action) {

                this.charPos = this.queue[0].length;
            }
            else {

                if ((this.charTimer += 1.0 * ev.step) >= CHAR_WAIT) {

                    this.charTimer -= CHAR_WAIT;
                    ++ this.charPos;

                    if (this.charPos < this.queue[0].length && 
                        this.queue[0].charCodeAt(this.charPos) == '\n') {

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

                if (this.queue.length == 0) {

                    this.active = false;
                }
            }
        }
    }


    // Draw
    draw(c) {

        const CORNER_OFF = 2;
        const TEXT_OFF_X = 0;
        const TEXT_OFF_Y = 2;
        const COLORS = [255, 0, 85];

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
    }

}
