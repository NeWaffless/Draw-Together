/*
todo:
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
    - rename test grid
    - fix puzzle piece gaps (little slithers of white)
    - fix puzzle piece sizing and ratio
    - add radix to parseInt
*/

const jigsawTemplatePath = '../assets/jigsaw_pieces/';
const drawingPath = '../backend/user_imgs/';
let drawings = [];

function createGrid() {
    const width = 110;
    const height = 110;

    const jigsaw = new JigsawGrid(drawings.length);
    for(let i = 1; i < jigsaw.grid.length; i++) {
        // todo: convert pos to x,y

        const piece = document.createElement('div');
        piece.className += "jigsaw-piece";
        piece.style.width = `${width}px`;
        piece.style.height = `${height}px`;

        const pos = jigsaw.gridPos(i);
        let x = pos[0];
        let y = pos[1];
        // x,y position math because the grid does not contain a 0 row or col
        if(y > 0) y -= 1;
        x *= -1;
        if(x > 0) x -= 1;

        piece.style.top = `${(x * height)}px`;
        piece.style.left = `${(y * width)}px`;
        
        let col = 'blk';
        if(i > prompt) {
            const drawing = document.createElement('img');
            drawing.className += "drawing";
            drawing.src = drawings[i - prompt - 1].drawStr;
            drawing.style.width = `${(width - parseInt(width / 10))}px`;
            drawing.style.height = `${(height - parseInt(height / 10))}px`;
            drawing.style.top = `${parseInt(width / 10)}px`;
            drawing.style.left = `${parseInt(height / 10)}px`;
            col = drawings[i - prompt - 1].col;
            piece.appendChild(drawing);
        }
        
        
        const template = document.createElement('img');
        template.className += "template";
        
        // assign num to drawing col
        template.src = jigsawTemplatePath + `${col}.svg`;
        // this fraction is the main square of the piece / the piece connector
        template.style.width = `${(width + parseInt(width / 10))}px`;
        template.style.height = `${(height + parseInt(height / 10))}px`;

        piece.appendChild(template);

        // todo: maybe change this so that it does not store the html element, and instead the json contained at the html
        jigsaw.addToGrid(i, piece);
        document.getElementById('jigsaw').appendChild(piece);

    }


}


async function getDrawings() {
    // probably change this to GET
        // receive all drawings
    const options = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    };
    const serverContact = await fetch('/drawings', options);
    const result = await serverContact.json();
    drawings.push(...result);
    createGrid();
}

getDrawings();



// ------------------------ GRID DEMO  ------------------------ //



/*
const red = 'rgb(255, 0, 0)';
const green = 'rgb(0, 255, 0)';

const size = 53;
const width = 110;
const height = 110;

const grid = new JigsawGrid(size);
for(let i = 1; i <= size; i++) {
    let pos = grid.gridPos(i);

    const piece = document.createElement('div');
    piece.className += "jigsaw-piece";
    piece.style.width = `${width}px`;
    piece.style.height = `${height}px`;

    if(pos[1] > 0) pos[1] -= 1;
    pos[0] *= -1;
    if(pos[0] > 0) pos[0] -= 1;
    piece.style.top = `${(pos[0] * height)}px`;
    piece.style.left = `${(pos[1] * width)}px`;
    
    // used for visual testing
    // const r = Math.floor(Math.random() * 256);
    // const g = Math.floor(Math.random() * 256);
    // const b = Math.floor(Math.random() * 256);
    // piece.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    piece.style.backgroundColor = green;

    const text = document.createElement('h1');
    text.innerHTML = `${i}`;

    piece.appendChild(text);
    grid.addToGrid(i, piece);
    document.getElementById('jigsaw').appendChild(piece);
}


// used for demonstrative purposes
let cursor = 1;
grid.grid[cursor].style.backgroundColor = red;
document.onkeydown = function(e) {
    let dir;
    switch(e.key) {
        case 'w':
            dir = Direction.UP;
            break;
        case 'd':
            dir = Direction.RIGHT;
            break;
        case 's':
            dir = Direction.DOWN;
            break;
        case 'a':
            dir = Direction.LEFT;
            break;
        default:
            console.log(e.key);
            break;
    }
    const temp = cursor;
    cursor = grid.gridPosInDir(cursor, dir);
    if(cursor < grid.grid.length) {
        grid.grid[temp].style.backgroundColor = green;
        grid.grid[cursor].style.backgroundColor = red;
    }  else {
        cursor = temp;
    }
}

*/
