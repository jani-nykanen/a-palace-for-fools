import { State } from "./engine/input.js";
import { TransitionMode, Transition } from "./engine/transition.js";

//
// "Enable audio?" intro screen
//
// (c) 2019 Jani Nykänen
//


export class EnableAudioScreen {


    constructor() {


        this.cursorPos = 0;

        
    }


    // Initialize
    init(ev) {

    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        if (ev.input.action.up.state == State.Pressed ||
            ev.input.action.down.state == State.Pressed) {

            this.cursorPos = (this.cursorPos +1) % 2;
        }

        // Check enter press
        if (ev.input.action.start.state == State.Pressed) {

            if (this.cursorPos == 1)
                ev.audio.toggle(false);
            else
                ev.audio.playSample(ev.audio.sounds.accept, 0.50);


            ev.tr.activate(false, TransitionMode.VerticalBar, 1.0);
            ev.changeScene("game");
        }
    }


    // Draw 
    draw(c) {

        c.clear(0);

        let str = ["@YES\n NO", " YES\n@NO"][this.cursorPos];
        
        c.drawText(c.bitmaps.font, 
            "ENABLE AUDIO?\n(PRESS ENTER TO\nCONFIRM.)",
            24, 32, 0, 2);

        c.drawText(c.bitmaps.font,
            str,
            40, 72, 0, 2);
    }
}
