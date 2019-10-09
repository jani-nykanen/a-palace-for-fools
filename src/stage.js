import { Tilemap } from "./engine/tilemap.js";
import { negMod } from "./engine/util.js";
import { Sprite } from "./engine/sprite.js";
import { Dust } from "./dust.js";
import { Bat } from "./bat.js";

//
// Handles the game stage rendering
// and collision handling etc
//
// (c) 2019 Jani Nykänen
//


export class Stage {


    constructor(map) {

        const DUST_COUNT = 4;

        this.baseMap = map;
        this.map = new Tilemap(map);
        this.w = this.map.w;
        this.h = this.map.h;

        this.waterSurface = new Sprite(16, 16);

        // Dust for breaking tiles
        this.dust = new Array(DUST_COUNT);
        for (let i = 0; i < DUST_COUNT; ++ i) {

            this.dust[i] = new Dust();
        }
    }


    // Reset
    reset() {

        this.map = new Tilemap(this.baseMap);
    }


    // Spawn dust
    spawnDust(x, y) {

        const DUST_SPEED = 5;

        let dust = null;
        for (let d of this.dust) {

            if (!d.exist) {

                dust = d;
                break;
            }
        }
        if (dust == null) return;

        dust.spawn(x*16 + 8, y*16 + 8, DUST_SPEED, 1);
    }


    // Is the tile solid
    isSolid(x, y, loop) {

        const SOLID = [1, 8];

        let t = this.map.getTile(0, x, y, loop);

        return SOLID.includes(t);
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


    // Draw ladder
    drawLadder(c, x, y) {

        let ts = c.bitmaps.tileset;

        let up = this.map.getTile(0, x, y - 1);
        if (up != 2 && up != 1) {

            // Draw ladder top
            c.drawBitmapRegion(ts, 
                96, 0, 16, 16,
                x*16, (y-1)*16);  
        }

        // Draw ladder base
        c.drawBitmapRegion(ts, 
            80, 0, 16, 16,
            x*16, y*16);  
    }


    // Draw spikes
    drawSpikes(c, t, x, y) {

        let ts = c.bitmaps.tileset;

        const DIR_X = [1, 0, 1, 0];
        const DIR_Y = [0, 1, 0, 1];

        let dx = 0;
        let dy = 0;

        let jump = 0;
        // If not a similar spike (or wall) next to 
        // this spike, make the second spike slightly 
        // different
        let s = this.map.getTile(
            0, x + DIR_X[t], y + DIR_Y[t]);
        if (s != 3 + t && s != 1) {

            jump = 1;
        }

        // Draw both spikes, obviously
        for (let i = 0; i < 2; ++ i) {

            c.drawBitmapRegion(ts, 
                112 + t*16 + dx * jump, 
                dy * jump, 
                8 + DIR_Y[t]*8, 
                8 + DIR_X[t]*8,
                x*16 + dx, 
                y*16 + dy); 

            dx += DIR_X[t] * 8;
            dy += DIR_Y[t] * 8;
        }
    }


    // Draw water
    drawWater(c, x, y) {

        let ts = c.bitmaps.tileset;

        if (this.map.getTile(0, x, y-1, true) != 7) {

            c.drawSprite(this.waterSurface, ts,
                x*16, y*16);
        }
        else {

            c.drawBitmapRegion(ts, 14*16, 0, 16, 16,
                x*16, y*16);
        }
    }


    // Draw breaking wall
    drawBreakingWall(c, x, y) {

        let ts = c.bitmaps.tileset;

        let sx = 0;

        if (!this.isSolid(x, y-1, true) &&
            !this.isSolid(x, y+1, true)) {

            sx = 48;
        }
        else if (this.map.getTile(0, x, y-1) != 1) {

            sx = 16
        }
        else if (!this.isSolid(x, y+1, true)) {

            sx = 32;
        }
        else {

            sx = 0;
        }

        c.drawBitmapRegion(ts, sx, 16, 16, 16,
            x*16, y*16);
    }


    // Draw the (mostly static) tiles
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

                // Ladder
                case 2:

                    this.drawLadder(c, x, y);
                    break;
                
                // Spikes
                case 3:
                case 4:
                case 5:
                case 6:

                    this.drawSpikes(c, t-3, x, y);
                    break;

                // Water
                case 7:

                    this.drawWater(c, x, y);
                    break;

                // Breaking tile
                case 8:
                    
                    this.drawBreakingWall(c, x, y);
                    break;

                default:
                    break;
                }
            }
        }
    }


    // Update stage
    update(ev) {

        this.waterSurface.animate(0, 11, 13, 12, ev.step);

        // Update dust
        for (let d of this.dust) {

            d.update(ev);
        }
    }


    // Render the current visible map area
    draw(c, cam) {

        let x = Math.floor(cam.top.x / 16) -1;
        let y = Math.floor(cam.top.y / 16) -1;
        let w = cam.w/16 + 2;
        let h = cam.h/16 + 2;

        this.drawTiles(c, x, y, w, h);

        // Draw dust
        for (let d of this.dust) {

            d.draw(c);
        }
    }


    // Get wall collision with an object
    getWallCollision(o, x, y, breakable, ev) {

        const MARGIN = 2;

        let w;

        // Left
        if (!this.isSolid(x-1, y, true)) {

            w = o.verticalCollision(x*16, y*16, 16, -1, ev);
        }

        // Right
        if (!this.isSolid(x+1, y, true)) {

            w = w || o.verticalCollision((x+1)*16, y*16, 16, 1, ev);
        }

        // Break the wall
        if (o.breakWall && breakable && w) {

            this.map.setTile(0, x, y, 0);
            this.spawnDust(x, y);
            return;
        }

        // Top
        if (!this.isSolid(x, y-1, true)) {

            // If touched ground while climbing downwards, stop
            // climbing
            if (o.horizontalCollision(
                x*16-MARGIN, y*16, 16+MARGIN*2, 1, ev)) {

                if (o.climbing) {

                    o.climbing = false;
                }
            }
        }

        // Bottom
        if (!this.isSolid(x, y+1, true)) {

            o.horizontalCollision(x*16, (y+1) *16, 16, -1, ev);
        }
    }


    // Get ladder collision with an object
    getLadderCollision(o, x, y, ev) {

        const TOP_OFF = 12;

        o.ladderCollision(x*16, y*16, 16, 16);

        // Check if the ladder ends in the tile
        // above
        let s = this.map.getTile(0, x, y-1);
        if (s != 2 && s != 1) {

        
            if (!o.climbing)
                o.horizontalCollision(x*16, y*16, 16, 1, ev);  

            o.ladderCollision(x*16, (y-1)*16+TOP_OFF, 16, 16-TOP_OFF);

        }
    }


    // Get water collision
    getWaterCollision(o, x, y) {

        const TOP_OFF = 4;

        // Check if there is water in the tile
        // above
        let s = this.map.getTile(0, x, y-1);
        if (s != 7) {

            o.waterCollision(x*16, y*16+TOP_OFF, 
                16, 16-TOP_OFF);
        }
        else {

            o.waterCollision(x*16, y*16, 16, 16);
        }
    }


    // Get spike collision
    getSpikeCollision(o, t, x, y, ev) {

        const START_X = [4, 0, 4, 10];
        const START_Y = [10, 2, 0, 2];
        const WIDTH = [10, 6, 10, 6];
        const HEIGHT = [6, 12, 6, 12];

        o.hurtCollision(
            x*16 + START_X[t], y*16 + START_Y[t],
            WIDTH[t], HEIGHT[t], ev
        );

    }


    // Get collisions with a game object
    getCollisions(o, ev) {

        const RADIUS = 2; 

        let sx = Math.floor(o.pos.x / 16) - RADIUS;
        let sy = Math.floor(o.pos.y / 16) - RADIUS;

        let t;
        for (let y = sy; y <= sy + RADIUS*2; ++ y) {

            for (let x = sx; x <= sx + RADIUS*2; ++ x) {

                t = this.map.getTile(0, x, y, true);
                switch(t) {

                // Wall
                case 1:
                case 8:

                    this.getWallCollision(o, x, y, t == 8, ev);
                    break; 

                // Ladder
                case 2:

                    this.getLadderCollision(o, x, y, ev);
                    break;

                // Spikes
                case 3:
                case 4:
                case 5:
                case 6:
                    
                    this.getSpikeCollision(o, t-3, x, y, ev);
                    break;

                // Water
                case 7:

                    this.getWaterCollision(o, x, y);
                    break;

                    
                default:
                    break;
                }
            }
        }
    }


    // Parse objects
    parseObjects(objm) {

        let t;
        for (let y = 0; y < this.h; ++ y) {

            for (let x = 0; x < this.w; ++ x) {

                t = this.map.getTile(1, x, y);
                t -= 16;
                if (t <= 0) continue; 

                switch(t) {

                // Player
                case 1:

                    objm.setPlayerPosition(x, y);
                    break;

                // Bat
                case 2:

                    objm.addEnemy(
                        new Bat(x*16 + 8, y*16 + 8)
                    );
                    break;

                default:
                    break; 
                }
            }
        }
    }

}
