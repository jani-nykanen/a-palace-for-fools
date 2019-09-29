import { Tilemap } from "./engine/tilemap.js";
import { negMod } from "./engine/util.js";

//
// Handles the game stage rendering
// and collision handling etc
//
// (c) 2019 Jani Nykänen
//


export class Stage {


    constructor(map) {

        this.map = new Tilemap(map);
        this.w = this.map.w;
        this.h = this.map.h;
    }


    // Draw a wall tile
    drawWallTile(c, x, y) {

        let ts = c.bitmaps.tileset;

        let tl = this.map.getTile(0, x-1, y-1, true);
        let tr = this.map.getTile(0, x+1, y-1, true);
        let bl = this.map.getTile(0, x-1, y+1, true);
        let br = this.map.getTile(0, x+1, y+1, true);
        
        let l = this.map.getTile(0, x-1, y, true);
        let t = this.map.getTile(0, x, y-1, true);
        let r = this.map.getTile(0, x+1, y, true);
        let b = this.map.getTile(0, x, y+1, true);

        let corners = [l, t, r, b];
        let diagonal = [tl, tr, br, bl];
        
        const PX = [0, 1, 1, 0];
        const PY = [0, 0, 1, 1];

        // If empty everywhere, just draw the background
        // and stop here
        let empty = true;
        for (let i = 0; i < 4; ++ i) {

            if (corners[i] != 1 || diagonal[i] != 1) {

                empty = false;
                break;
            }
        }
        if(empty) {

            c.drawBitmapRegion(ts, 
                0, 0, 16, 16,
                x*16, y*16);
            return;
        }

        // Draw corners
        let sx, sy;
        for (let i = 0; i < 4; ++ i) {

            // No tiles in any direction
            if (corners[i] != 1 && corners[(i+1)%4] != 1) {

                sx = 16 + PX[i] * 8;
                sy = 0 + PY[i] * 8;

                c.drawBitmapRegion(ts, sx, sy, 8, 8,
                    x*16 + PX[i]*8, y*16 + PY[i]*8);
            }
            // Tiles in "all" the directions
            else if (corners[i] == 1 && 
                     corners[(i+1)%4] == 1 &&
                     diagonal[i] != 1) {

                sx = 32 + PX[i] * 8;
                sy = 0 + PY[i] * 8;

                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);
            }

            // No tile in the facing direction,
            // but tile in the next position
            if (corners[i] != 1 &&
                    corners[(i+1)%4] == 1) {

                sx = 48 + PX[i] * 8;
                sy = 0 + PY[i] * 8;
        
                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);        
            }

            // No tile in the facing direction,
            // but tile in the previous position
            if (corners[(i+1)%4] != 1 &&
                corners[i] == 1) {

                sx = 64 + PX[i] * 8;
                sy = 0 + PY[i] * 8;
        
                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);        
            }

            // "Pure wall" tiles
            if (corners[i] == 1 &&
                corners[(i+1)%4] == 1 &&
                diagonal[i] == 1) {

                sx = PX[i] * 8;
                sy = PY[i] * 8;

                c.drawBitmapRegion(ts, 
                    sx, sy, 8, 8,
                    x*16 + PX[i]*8, 
                    y*16 + PY[i]*8);  
            }
        }

    }


    // Draw the (static) tiles
    drawTiles(c, sx, sy, w, h) {

        let t;
        for (let y = sy; y < sy + h; ++ y) {

            for (let x = sx; x < sx + w; ++ x) {

                t = this.map.getTile(0, x, y, true);
                switch(t) {

                // Wall
                case 1:

                    this.drawWallTile(c, x, y);
                    break;  

                
                default:
                    break;
                }
            }
        }
    }


    // Render the current visible map area
    draw(c, x, y) {

        this.drawTiles(c,
            (x*160) | 0, 
            (y*144) | 0, 
            160, 144);
    }

}
