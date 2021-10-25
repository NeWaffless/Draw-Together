/*
todo:
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
    - calculate grid size
    - make drawings append outwards
    - make 4 black tiles in centre squares
    - stop appending drawings once all drawings are placed
    - rename test grid
*/

const jigsawTemplatePath = '../assets/jigsaw_pieces/';
const drawingPath = '../backend/user_imgs/';
let drawings = [];

function createGrid() {
    const gridSize = Math.ceil(Math.sqrt(drawings.length));
    const width = 110;
    const height = 110;

    // this may be fucked (-gridSize/2)
    for(let i = parseInt(-gridSize/2); i < parseInt(gridSize/2); i++) {
        for(let j = parseInt(-gridSize/2); j < parseInt(gridSize/2); j++) {
            
            const drawingNum = (((i + parseInt(gridSize/2)) * gridSize) + (j + parseInt(gridSize/2))) % 15;

            
            const piece = document.createElement('div');
            piece.className += "jigsaw-piece";
            piece.style.width = `${width}`;
            piece.style.height = `${height}`;
            piece.style.top = `${(j * height)}px`;
            piece.style.left = `${(i * width)}px`;


            const drawing = document.createElement('img');
            drawing.className += "drawing";
            drawing.src = drawings[drawingNum].drawStr;
            drawing.style.width = `${(width - parseInt(width / 10))}px`;
            drawing.style.height = `${(height - parseInt(height / 10))}px`;
            drawing.style.top = `${parseInt(width / 10)}px`;
            drawing.style.left = `${parseInt(height / 10)}px`;
            
            const template = document.createElement('img');
            template.className += "template";
            
            // assign num to drawing col
            template.src = jigsawTemplatePath + `${drawings[drawingNum].col}.svg`;
            // this fraction is the main square of the piece / the piece connector
            template.style.width = `${(width + parseInt(width / 10))}px`;
            template.style.height = `${(height + parseInt(height / 10))}px`;
            
            // positioning script here
                // probably make this a function
            // template.style.left = (i * width).toString() + 'px';
            // template.style.top = (j * height).toString() + 'px';
            



            // used for visual testing
            // const r = Math.floor(Math.random() * 256);
            // const g = Math.floor(Math.random() * 256);
            // const b = Math.floor(Math.random() * 256);
            // template.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

            piece.appendChild(template);
            piece.appendChild(drawing);
            document.getElementById('test-grid').appendChild(piece);
        }
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

// getDrawings();

const red = 'rgb(255, 0, 0)';
const green = 'rgb(0, 255, 0)';

const size = 36;
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
    document.getElementById('test-grid').appendChild(piece);
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

