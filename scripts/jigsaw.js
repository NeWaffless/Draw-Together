/*
todo:
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
    - fix puzzle piece gaps (little slithers of white)
    - fix puzzle piece sizing and ratio
    - add radix to parseInt
    - remove grid demo
    - jigsaw placement algorithm
    - probably split this file into multiple js files
*/

const jigsawTemplatePath = '../assets/jigsaw/jigsaw_pieces/';
let jigsaw;
let drawings = [];

// todo: reformat this function
function createGrid() {
    const width = 110;
    const height = 110;

    jigsaw = new JigsawGrid(drawings.length);
    for(let i = 1; i < jigsaw.grid.length; i++) {
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
            // allows click and drag over jigsaw
            drawing.setAttribute('draggable', false);
            col = drawings[i - prompt - 1].col;
            drawing.onclick = function() { drawingClicked(i); };
            piece.appendChild(drawing);
        }
        
        
        const template = document.createElement('img');
        template.className += "template";
        
        // assign num to drawing col
        template.src = jigsawTemplatePath + `${col}.svg`;
        // this fraction is the main square of the piece / the piece connector
        template.style.width = `${(width + parseInt(width / 10))}px`;
        template.style.height = `${(height + parseInt(height / 10))}px`;
        // allows click and drag over jigsaw
        template.setAttribute('draggable', false);
        if(i > prompt) {
            template.onclick = function() { drawingClicked(i); };
        }

        piece.appendChild(template);

        // todo: maybe change this so that it does not store the html element, and instead the json contained at the html
        jigsaw.addToGrid(i, piece);
        
        document.getElementById('jigsaw').appendChild(piece);

    }


}

async function getDrawings() {
    const options = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    };
    // todo: standardise these calls
    const serverContact = await fetch('/drawings', options);
    const result = await serverContact.json();
    drawings.push(...result);
    createGrid();
}



getDrawings();



async function logout() {
    const options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    fetch('/logout', options);
    
    window.location.href = 'landing-page.html';
}

let clicked = false;
let moved = false;
let startX = 0;
let startY = 0;
let lastX, lastY;
const delta = 6;
const jigsawElement = document.getElementById('jigsaw');

document.addEventListener('mousedown', function(ev) {
    clicked = true;
    moved = false;
    startX = ev.clientX;
    startY = ev.clientY;
});

document.addEventListener('mousemove', function(ev) {
    // todo: only register if not hidden
    if(clicked && (Math.abs(ev.clientX - startX) > delta
    || Math.abs(ev.clientY - startY) > delta)) {
        moved = true;

        // todo: lock panning so middle of puzzle cannot go offscreen
        jigsawElement.style.top = `${jigsawElement.offsetTop + ev.clientY - lastY}px`;
        jigsawElement.style.left = `${jigsawElement.offsetLeft + ev.clientX - lastX}px`;
    }
    lastX = ev.clientX;
    lastY = ev.clientY;
});

document.addEventListener('mouseup', function() {
    clicked = false;
});

function drawingClicked(d) {
    if(moved) {
        moved = false;
        return;
    }

    switchPage(1, d);
}

// todo: this is TERRIBLE, change it to local storage or something of that nature
    // not some random floating variable
// todo: these magic numbers are horrific
let currDrawing;

function changeCurrentDrawing(d) {
    let newDrawing = currDrawing + d;
    if(newDrawing < 5) {
        newDrawing = drawings.length + 5 - 1;
    } else if(newDrawing >= drawings.length + 5) {
        newDrawing = 5;
    }
    switchPage(1, newDrawing);
}

function switchPage(state, d) {
    if(state === 1) {
        document.getElementById('all-drawings').style.display = 'none';
        document.getElementById('individual-drawing').style.display = 'initial';
        const piece = jigsaw.grid[d];
        currDrawing = d;
        document.getElementById('one-drawing-template').src = piece.childNodes[1].src;
        document.getElementById('one-drawing').src = piece.childNodes[0].src;
    } else {
        document.getElementById('all-drawings').style.display = 'initial';
        document.getElementById('individual-drawing').style.display = 'none';
    }
}

// ------------------------ GRID DEMO  ------------------------ //



/*

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

