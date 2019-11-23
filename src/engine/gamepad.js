import { Vector2 } from "./vector.js";

//
// A simple gamepad manager/listener
//
// (c) 2019 Jani Nykänen
//


export class GamePad {

    constructor() {

        this.stick = new Vector2();
        this.oldStick = new Vector2();
        this.delta = new Vector2();

        this.buttons = new Array();

        this.pad = null;
        this.index = 0;

        window.addEventListener("gamepadconnected", (e) => {

            let func = navigator.getGamepads ?  
                navigator.getGamepads : 
                navigator.webkitGetGamepad;
            if (func == null)
                return;

            let gp = navigator.getGamepads()[e.gamepad.index];
            this.index = e.gamepad.index;
            this.pad = gp;

            // Update stuff
            this.updateGamepad(this.pad);
        });
    }


    // Get gamepads available
    pollGamepads() {

        // Just in case...
        if (navigator == null)
            return null;

        return navigator.getGamepads ? 
            navigator.getGamepads() : 
            (navigator.webkitGetGamepads ? 
                navigator.webkitGetGamepads : 
                null);
    }


    // Update "analogue" stick
    updateStick(pad) {

        if (pad != null) {

            this.stick.x = pad.axes[0];
            this.stick.y = pad.axes[1];
        }

        // Compute delta
        this.delta.x = this.stick.x - this.oldStick.x;
        this.delta.y = this.stick.y - this.oldStick.y;

        // Store old stick state
        this.oldStick = this.stick.clone();
    }


    // Update gamepad
    updateGamepad(pad) {
        
        this.updateStick(pad);
    }


    // Refresh state
    refresh() {

        // No gamepad available, quit
        if (this.pad == null) return;

        // Poll gamepads
        let pads = this.pollGamepads();
        if (pads == null) 
            return;
        this.pad = pads[this.index];
    }


    // Update
    update() {

        // Reset stick
        this.stick.x = 0.0;
        this.stick.y = 0.0;

        // Refresh available gamepads
        this.refresh();

        // Update the current gamepad
        this.updateGamepad(this.pad);
    }

}