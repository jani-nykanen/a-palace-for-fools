import { negMod } from "./util.js";

//
// A tilemap
//
// (c) 2019 Jani Nykänen
//


export class Tilemap {


    constructor(doc) {

        // Get dimensions
        let root = doc.getElementsByTagName("map")[0];
        this.w = String(root.getAttribute("width"));
        this.h = String(root.getAttribute("height"));
        
        // Get layers
        let data = root.getElementsByTagName("layer");
        this.layers = new Array();
        let str, content;
        for (let i = 0; i < data.length; ++ i) {

            // Get layer data & remove newlines
            str = data[i].getElementsByTagName("data")[0].
                childNodes[0].
                nodeValue.
                replace(/(\r\n|\n|\r)/gm, "");
            // Put to an array
            content = str.split(",");

            // Create a new layer
            this.layers.push(new Array());
            for (let j = 0; j < content.length; ++ j) {

                this.layers[i][j] = parseInt(content[j]);
            }
        }
    }


    // Get a tile value in the given coordinate
    getTile(layer, x, y, loop) {

        if (loop) {

            x = negMod(x, this.w);
            y = negMod(y, this.h);
        }

        return this.layers[layer][y*this.w+x];
    }
}
