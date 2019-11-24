import { Menu, MenuButton } from "./menu.js";
import { TransitionMode } from "./engine/transition.js";

//
// Title screen
//
// (c) 2019 Jani Nykänen
//


export class TitleScreen {

    constructor() {

        this.cursorPos = 0;
    }


    // Initialize
    init(ev) {

        this.menu = new Menu(
            new MenuButton("New Game", (ev) => {

                this.menu.disable();
                ev.tr.activate(true, TransitionMode.VerticalBar, 2.0,
                    (ev) => {
                        ev.changeScene("game", true);
                    });
            }),
            new MenuButton("Continue", (ev) => {

                this.menu.disable();
                ev.tr.activate(true, TransitionMode.VerticalBar, 2.0,
                    (ev) => {
                        ev.changeScene("game", false);
                    });
            })
        );
        this.menu.activate(0);
    }


    // Update
    update(ev) {

        if (ev.tr.active) return;

        this.menu.update(ev);
    }


    // Draw 
    draw(c) {

        c.clear(85,170,255);

        c.drawBitmap(c.bitmaps.logo, 0, 8);

        c.move(0, 32);
        this.menu.draw(c);
        c.moveTo(0, 0);
    }


    // On change
    onChange(ev) {

        this.menu.activate(0);
    }
}
