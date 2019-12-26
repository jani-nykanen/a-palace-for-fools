import { TransitionMode, Transition } from "./engine/transition.js";
import { Textbox } from "./textbox.js";

//
// The story intro
//
// (c) 2019 Jani Nykänen
//


export class StoryIntro {

    constructor() {

    }


    // Initialize
    init(ev) {

        this.textbox = new Textbox(ev);
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.textbox.update(ev);

        if (!this.textbox.active) {

            ev.audio.stopMusic();
            ev.changeScene("game", true);
            ev.tr.activate(false, TransitionMode.CircleOutside, 1.0);
            ev.tr.setCenter();
        }
    }


    // Draw 
    draw(c) {

        c.clear(0);
        
        this.textbox.draw(c, true);
    }


    // On change
    onChange(ev) {

        ev.tr.active = false;

        this.textbox.addMessage(
            ...ev.loc.dialogue.story
        );
    
        this.textbox.activate();
        this.textbox.doNotResumeMusic();
    }
}
