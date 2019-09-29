import { FrameEvent } from "./event.js";
import { Canvas } from "./canvas.js";
import { AssetLoader } from "./assets.js";

//
// Game core
// (c) 2019 Jani Nykänen
//


export class Core {


    constructor(config) {

        // Parse configuration
        this.frameRate = this.getConfParam(config,
            "frameRate", 60);
        this.canvasWidth = this.getConfParam(config,
            "canvasWidth", 320);
        this.canvasHeight = this.getConfParam(config,
            "canvasHeight", 240);   

        // Create components 
        this.ev = new FrameEvent();
        this.canvas = new Canvas(this.canvasWidth, 
                                 this.canvasHeight);
        this.assets = new AssetLoader();

        // Store references to certain assets to certain
        // objects, to we can easily have access to them
        // later
        this.canvas.bitmaps = this.assets.bitmaps;
        this.ev.documents = this.assets.documents;

        // Compute required values
        this.ev.step = 60.0 / this.frameRate;
        this.target = 1000.0 / this.frameRate;

        // Set some basic events
        window.addEventListener("resize",
            (e) => {
                // No need to get data from the event
                this.canvas.resize(window.innerWidth, 
                    window.innerHeight)
            });

        this.timeSum = 0;
        this.oldTime = 0;

        this.initialized = false;
    }


    // Get parameter from the configuration object.
    // If something goes wrong, return the default
    // value
    getConfParam(conf, param, def) {

        if (conf == null || conf[param] == null)
            return def;

        return conf[param];
    }


    // Main loop happens here
    loop(ts) {

        // In the case refresh rate gets too low,
        // we don't want the game update its logic
        // more than 5 times (i.e. the minimum fps
        // is 60 / 5 = 12)
        const MAX_REFRESH = 5;

        this.timeSum += ts - this.oldTime;

        // Compute target loop count
        let loopCount = Math.floor(this.timeSum / this.target) | 0;
        if (loopCount > MAX_REFRESH) {

            this.timeSum = MAX_REFRESH * this.target;
            loopCount = MAX_REFRESH;
        }

        // If no looping, no reason to redraw
        let redraw = loopCount > 0;

        // Update game logic
        while ( (loopCount --) > 0) {

            if (this.assets.hasLoaded()) {

                // Initialize scenes now
                if (!this.initialized) {

                    // Initialize scenes
                    this.ev.initScenes(this.canvas);

                    this.initialized = true;
                }

                // Update frame event
                this.ev.update();
            }

            this.timeSum -= this.target;
            redraw = true;
        }

        // (Re)draw the scene
        if (redraw) {

            if (this.assets.hasLoaded()) {
                
                this.ev.drawScene(this.canvas);
            }
        }

        this.oldTime = ts;

        // Next frame
        window.requestAnimationFrame( 
            (ts) => this.loop(ts) 
        );
    }


    // Add scenes. The first scene
    // passed will be made active
    addScenes() {

        let active = false;
        for (let a of arguments) {

            this.ev.addScene(a, !active);
            active = true;
        }
    }


    // Configure "actions", i.e. key configuration,
    // really
    configActions() {

        for (let a of arguments) {

            this.ev.input.addAction(a.name, a.key);
        }
    }


    // Starts the application. Never returns.
    run() {

        // Start the main loop
        this.loop(0);
    }
}
