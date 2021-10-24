/*
    todo
    - error checking
    - methods may not need to be static
    - determine if magic numbers can be removed
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
        this.grid.length += this.ringMax(this.size);
    }

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

    getRing(n) {
        return (Math.sqrt(this.ringMax(n)) - 2) / 2;
    }

    getQuadSize(n) {
        return 2 * (this.getRing(n) + 1);
    }

    getLocalMin(n, d) {
        return this.ringMin(n) + d * (this.getQuadSize(n) - 1);
    }

    getLocalMax(n, d) {
        return this.ringMin(n) + (d + 1) * (this.getQuadSize(n) - 1);
    }

    // returns side of the ring a number is on
        // note, numbers in corners are on multiple sides
        // side is selected to make quadrants even
    quadrant(n) {        
        for(let i = 0; i < Object.keys(Direction).length; i++) {
            if(n >= this.getLocalMin(n, i) && n < this.getLocalMax(n, i)) {
                return i;
            }
        }

        throw new Error(`Could not find a quadrant for ${n}?!`);
    }

    // returns grid locations specific to defined grid setup
        // review documentation for visualised grid setup
    gridPos(n) {
        const ring = this.getRing(n);
        const quad = this.quadrant(n);
        const lmin = this.getLocalMin(n, quad);
        const lmax = this.getLocalMax(n, quad);
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

    // arrayPosInDir(n, d) {

    // }

    // appendDrawing(drawing) {

    // }


}