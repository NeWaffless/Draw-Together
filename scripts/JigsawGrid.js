/*
todo:
    - error checking
    - methods may not need to be static
    - dtry to refactor out magic numbers
    - check where returning should be - 1 for array index
*/

// first four puzzle pieces reserved for prompts
const prompt = 4;

const Direction = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

class JigsawGrid {
    constructor(size) {
        this.grid = [];
        this.size = size + prompt;

        this.createGrid();
    }

    // initialises grid size equal to ring max
    createGrid() {
        // note, does not fill with null values
        // +1 because arithmetic on a grid indexing from 1 is much simpler than indexing from 0
        this.grid.length += this.ringMax(this.size) + 1;
    }

    // addRing() {

    // }

    // finds next largest even square number >= a number
        // symbolises the maximum value in a ring of the grid
        // each ring can only be a square of an even integer
    ringMax(n) {
        let inc = 0;
        let i = 0;
        while(i < n) {
            i = inc ** 2;
            inc += 2;
        }

        return i;
    }

    // finds the closest even square number <= a number
        // symbolises the minimum value in a ring of the grid
    ringMin(n) {
        let i = Math.sqrt(this.ringMax(n));
        if(i != 0) {
            i -= 2;
        }
        return i**2 + 1;
    }

    // --- helper functions ---

    ring(n) {
        return (Math.sqrt(this.ringMax(n)) - 2) / 2;
    }

    // returns side of the ring a number is on
        // note, numbers in corners are on multiple sides
        // side is selected to make quadrants even
    quadrant(n) {        
        for(let i = 0; i < Object.keys(Direction).length; i++) {
            if(n >= this.quadMin(n, i) && n < this.quadMax(n, i)) {
                return i;
            }
        }

        throw new Error(`Could not find a quadrant for ${n}?!`);
    }

    quadSize(n) {
        return 2 * (this.ring(n) + 1);
    }

    quadMin(n, d) {
        return this.ringMin(n) + d * (this.quadSize(n) - 1);
    }

    quadMax(n, d) {
        return this.ringMin(n) + (d + 1) * (this.quadSize(n) - 1);
    }

    // returns grid locations specific to defined grid setup
        // review documentation for visualised grid setup
    gridPos(n) {
        const ring = this.ring(n);
        const quad = this.quadrant(n);
        const lmin = this.quadMin(n, quad);
        const lmax = this.quadMax(n, quad);
        let row, col, a;

        // if n < half of row / col, determine val based on min
            // else, determine value based on max
        if(n < lmin + ring + 1) a = -1 * (ring + (lmin - n) + 1);
        else a = ring - (lmax - n) + 1;
        const b = ring + 1;

        if(quad % 2 === 0) {
            col = a;
            row = b;

            if(quad === 2) {
                row *= -1;
                col *= -1;
            }
        } else {
            row = a;
            col = b;

            if(quad === 3) col *= -1;
            else row *= -1;
        }

        return [row, col];
    }

    // returns the array position of the grid position in a direction from a point
    gridPosInDir(n, d) {
        // todo: this was done without thought, check to see what should be returned here
        if(n === 0) return n;

        const ringInc = this.ring(n) + 1;
        const pos = this.gridPos(n);
        const x = pos[0];
        const y = pos[1];

        const quad = this.quadrant(n);
        let inc = 1;

        const perpToQuad = function(perpDir) {
            let flip = 0;
            if(perpDir < 0) flip = 2;
    
            if(
                (x === ringInc && d === 0 + flip)
                || (x === -ringInc && d === 2 - flip)
                || (y === ringInc && d === 1 + flip)
                || (y === -ringInc && d === 3 - flip)
            ) {
                return true;
            }
            return false;
        }

        const isCorner = function () {
            if(Math.abs(x) + Math.abs(y) === 2 * ringInc) return true;
            return false;
        }

        // note, there is likely a more elegant way to perform this with function pointers
            // oh how I wish I could write elegant js

        // case going from max to min
        if(n === this.ringMax(n) && (d === Direction.UP || d === Direction.RIGHT)) {
            if(d === Direction.UP) return (Math.sqrt(n) - 2) ** 2 + 1;
            return n - Math.abs(16 * this.ring(n) -1);

        // case going from min to max
        } else if(n === this.ringMin(n) && (d === Direction.DOWN || d === Direction.LEFT)) {
            if(d === Direction.DOWN) return (Math.sqrt(n - 1) + 2) ** 2;
            return n + Math.abs(16 * ringInc - 1);

        // case direction perpendicular to quad away from centre
        } else if(perpToQuad(1)) {
            return n + (8 * ringInc) + (2 * d) - 3;

        // case direction perpendicular to quad toward centre (does not apply to corners)
        } else if(perpToQuad(-1) && !isCorner()) {
            if(d === Direction.RIGHT) d = Direction.LEFT;
            else d = Math.abs(d - 2); 
            return n - (8 * this.ring(n)) - (2 * d) + 3;

        // case moving forward or backward along array
        } else if(isCorner()) {
            if(
                (d % 2 !== 0 && quad % 2 !== 0)
                || (d % 2 === 0 && quad % 2 === 0)
            ) inc = -1;
            
            return n + inc;
        } else {
            inc = d;
            if(inc % 2 === 0) inc += 1;
            inc = -(inc - 2);
            if(quad === Direction.RIGHT || quad === Direction.DOWN) inc *= -1;

            return n + inc;
        }
        
    }

    addToGrid(n, content) {
        this.grid[n] = content;
    }

    // appendDrawing(drawing) {

    // }


}