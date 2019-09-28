//
// Input manager
// Handles all the input we need,
// mostly (or only?) keyboard
// (c) 2019 Jani Nykänen
//


// Input states
export const State = {
    Up: 0,
    Down: 1,
    Pressed: 2,
    Released: 3
};


export class InputManager {


    constructor() {

        this.keys = [];
        // Actions are defined by user, and it's
        // the right way to get the key input, because
        // action keys can be redefined, but it is sufficient
        // to change only the initialization code. Also,
        // this way we may call preventDefaul only for
        // the keys we need
        this.action = [];
        // This keys will be "preventDefault"ed.
        this.prevent = [];

        // Set listeners
        window.addEventListener("keydown", 
            (e) => {

                if (this.keyPressed(e.keyCode))
                    e.preventDefault();
            });
        window.addEventListener("keyup", 
            (e) => {

                if (this.keyReleased(e.keyCode))
                    e.preventDefault();
            });   
    
        // To get focus only
        window.addEventListener("mousemove", (e) => {

            window.focus();
        });
        // Disable context menu
        window.addEventListener("contextmenu", (e) => {

            e.preventDefault();
        });
    }



    // Calledn when a key pressed
    keyPressed(key) {

        if (this.keys[key] != State.Down)
            this.keys[key] = State.Pressed;

        return this.prevent[key];
    }


    // Called when a key released
    keyReleased(key) {

        if (this.keys[key] != State.Up)
            this.keys[key] = State.Released;

        return this.prevent[key];
    }


    // Update actions
    updateActions() {

        for (let n in this.action) {

            this.action[n].state = this.getKey(this.action[n].key);
        }
    }


    // Update input states
    updateStates() {

        for (let k in this.keys) {

            if (this.keys[k] == State.Pressed)
                this.keys[k] = State.Down;

            else if(this.keys[k] == State.Released) 
                this.keys[k] = State.Up;
        }

        
    }


    // Get the key state
    getKey(key) {

        return this.keys[key] | State.Up;
    }


    // Add an action
    addAction(name, key) {

        this.action[name] = {

            key: key,
            state: State.Up,
        };
        this.prevent.push(key);
    }

}
