/*
todo:
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
    - probably split this file into multiple js files
        - and / or organise functions
        - organise what script runs and what are functions / calls
    - access grid content through add and get methods
        - and other various JigsawGrid functions
    - have const references to dom elements
    - something is wrong when f12 using iPad as device, there's overflow??
    - iPad touch screen panning doesn't work for onmousedown / mouse move
    - users piece animates in (and offsets the jigsaw)
    - zoom in & zoom out animation
    - store JSONObj as opposed to DOM element
*/

const jigsawTemplatePath = '../assets/jigsaw/jigsaw_pieces/';
let jigsaw;
let drawings = [];
const minWidth = 110;
const minHeight = 110;

// todo: jigsaw placement algorithm
function createDOMElements() {
    for(let i = 1; i < jigsaw.size; i++) {
        const piece = document.createElement('div');
        piece.className += "jigsaw-piece";
        
        let col = 'blk';
        let name = '';
        if(i > prompt) {
            const drawing = document.createElement('img');
            drawing.className += "drawing";
            drawing.src = drawings[i - prompt - 1].drawStr;
            drawing.onclick = function() { drawingClicked(i); };
            drawing.setAttribute('draggable', false);
            piece.appendChild(drawing);
            
            col = drawings[i - prompt - 1].col;
            name = drawings[i - prompt - 1].name;
        }

        const template = document.createElement('img');
        template.className += "template";
        template.src = jigsawTemplatePath + `${col}.svg`;
        template.setAttribute('draggable', false);
        if(i > prompt) template.onclick = function() { drawingClicked(i); };
        piece.appendChild(template);

        jigsaw.addToGrid(i, {dom: piece, name: name});
        document.getElementById('jigsaw').appendChild(piece);
    }
}

// todo: fix puzzle piece gaps (little slithers of white)
    // fix puzzle piece sizing and ratio
function positionPieces(width, height) {
    for(let i = 1; i < jigsaw.size; i++) {
        const piece = jigsaw.grid[i].dom;
        const xOffset = parseInt(width / 10, 10);
        const yOffset = parseInt(height/ 10, 10);


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
        
        if(i > prompt) {
            // drawing
            piece.childNodes[0].style.width = `${width - xOffset}px`;
            piece.childNodes[0].style.height = `${height - yOffset}px`;
            piece.childNodes[0].style.top = `${xOffset}px`;
            piece.childNodes[0].style.left = `${yOffset}px`;

            // piece template
            piece.childNodes[1].style.width = `${width + xOffset}px`;
            piece.childNodes[1].style.height = `${height + yOffset}px`;
        } else {
            // piece template
            piece.childNodes[0].style.width = `${width + xOffset}px`;
            piece.childNodes[0].style.height = `${height + yOffset}px`;
        }
        
    }
}

function createGrid() {
    const width = minWidth;
    const height = minHeight;

    jigsaw = new JigsawGrid(drawings.length);
    createDOMElements();
    positionPieces(width, height);
    document.body.removeChild(document.getElementById('loading'));

}

async function getDrawings() {
    const loading = document.createElement('p');
    loading.innerHTML = 'LOADING PIECES';
    loading.setAttribute("id", "loading");
    document.body.appendChild(loading);

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



async function logoutConfirmed() {
    const options = {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    fetch('/logout', options);
    // todo: maybe this should not redirect?
    window.location.href = 'sign-in.html';
}

function logoutClicked() {
    document.getElementById('logout-confirmation').style.display = 'flex';
}

function logoutCancelled() {
    document.getElementById('logout-confirmation').style.display = 'none';
}

let clicked = false;
let moved = false;
let startX = 0;
let startY = 0;
let lastX, lastY;
const delta = 6;
const jigsawElement = document.getElementById('jigsaw');

document.addEventListener('mousedown', function(ev) {
    if(document.getElementById('all-drawings').style.display === 'none') return;

    clicked = true;
    moved = false;
    startX = ev.clientX;
    startY = ev.clientY;
});

document.addEventListener('mousemove', function(ev) {
    if(clicked && (Math.abs(ev.clientX - startX) > delta
    || Math.abs(ev.clientY - startY) > delta)) {
        moved = true;

        // constrain panning height and width
        const topDiff = ev.clientY - lastY;
        const newTop = jigsawElement.offsetTop + topDiff;
        let topOffset = (jigsaw.ring(jigsaw.size - 1) - 1) * parseInt(jigsaw.grid[1].dom.style.height);
        if((newTop >= -topOffset && newTop <= document.documentElement.clientHeight + topOffset)
            || (newTop < -topOffset && topDiff > 0)
            || (newTop > document.documentElement.clientHeight + topOffset && topDiff < 0))
        {
            jigsawElement.style.top = `${newTop}px`;
        }

        const leftDiff = ev.clientX - lastX;
        const newLeft = jigsawElement.offsetLeft + leftDiff;
        const leftOffset = (jigsaw.ring(jigsaw.size - 1) - 1) * parseInt(jigsaw.grid[1].dom.style.width);
        if((newLeft >= -leftOffset && newLeft <= document.documentElement.clientWidth + leftOffset)
            || (newLeft < -leftOffset && leftDiff > 0)
            || (newLeft > document.documentElement.clientWidth + leftOffset && leftDiff < 0))
        {
            jigsawElement.style.left = `${newLeft}px`;
        }
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
    if(newDrawing <= prompt) {
        newDrawing = jigsaw.size - 1;
    } else if(newDrawing >= jigsaw.size) {
        newDrawing = prompt + 1;
    }
    switchPage(1, newDrawing);
}

// todo: this is scuffed
function switchPage(state, d) {
    if(state === 1) {
        document.getElementById('all-drawings').style.display = 'none';
        document.getElementById('individual-drawing').style.display = 'initial';
        const piece = jigsaw.grid[d].dom;
        console.log();
        currDrawing = d;
        let backdropCol = Math.floor(drawings[d - prompt - 1].col / 3);
        document.getElementById('one-drawing-backdrop').src = `../assets/jigsaw/jigsaw_pieces/backdrop-${backdropCol}.svg`;
        document.getElementById('one-drawing-template').src = piece.childNodes[1].src;
        document.getElementById('one-drawing').src = piece.childNodes[0].src;
        document.getElementById('child-name').innerHTML = jigsaw.grid[d].name;
        document.getElementById('save').href = piece.childNodes[0].src;
        document.getElementById('save').download = jigsaw.grid[d].name + "'s drawing";
    } else {
        document.getElementById('all-drawings').style.display = 'initial';
        document.getElementById('individual-drawing').style.display = 'none';
    }
}

// todo: shift jigsaw position when zooming
    // or add to future that middle of screen stays consistent with resize
let zoomState = false;
function switchZoom() {
    if(!zoomState) {
        positionPieces(300, 300);
        document.getElementById('prompt-content').style.width = '450px';
        document.getElementById('prompt-content').style.height = '450px';
        document.getElementById('week').style.fontSize = "45px";
        document.getElementById('prompt').style.fontSize = "70px";
        document.getElementById('zoom-text').innerHTML = "Zoom Out";
        zoomState = true;
    } else {
        positionPieces(minWidth, minHeight);
        document.getElementById('prompt-content').style.width = '180px';
        document.getElementById('prompt-content').style.height = '180px';
        document.getElementById('week').style.fontSize = "18px";
        document.getElementById('prompt').style.fontSize = "28px";
        document.getElementById('zoom-text').innerHTML = "Zoom In";
        zoomState = false;
    }
}