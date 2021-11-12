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
*/

const jigsawTemplatePath = '../assets/jigsaw/jigsaw_pieces/';
let jigsaw;
let drawings = [];
const minWidth = 110;
const minHeight = 110;

function createDOMElements() {
    for(let i = 1; i < drawings.length + question + buffer; i++) {
        const piece = document.createElement('div');
        piece.className += "jigsaw-piece";
        
        let col = 'blk';
        const drawing = document.createElement('img');
        if(i > question) {
            drawing.className += "drawing";
            drawing.src = drawings[i - question - 1].drawStr;
            drawing.setAttribute('draggable', false);
            piece.appendChild(drawing);
            
            col = drawings[i - question - 1].col;
        }

        const template = document.createElement('img');
        template.className += "template";
        template.src = jigsawTemplatePath + `${col}.svg`;
        template.setAttribute('draggable', false);
        piece.appendChild(template);

        if(i > question) {
            const pos = jigsaw.addToGrid({dom: piece, obj: drawings[i - question - 1]});
            drawing.onclick = function() { drawingClicked(pos); };
            template.onclick = function() { drawingClicked(pos); };
        } else {
            jigsaw.addToGrid({dom: piece, obj: null});
        }
        document.getElementById('jigsaw-content').appendChild(piece);
    }
}

// todo: fix puzzle piece gaps (little slithers of white)
    // fix puzzle piece sizing and ratio
function positionPieces(width, height) {
    for(let i = 1; i < jigsaw.grid.length; i++) {
        if(jigsaw.grid[i] === null) continue;
        const piece = jigsaw.getDOM(i);
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
        
        if(i > question) {
            const drawingStyle = piece.childNodes[0].style;
            drawingStyle.width = `${width - xOffset}px`;
            drawingStyle.height = `${height - yOffset}px`;
            drawingStyle.top = `${xOffset}px`;
            drawingStyle.left = `${yOffset}px`;

            const templateStyle = piece.childNodes[1].style;
            templateStyle.width = `${width + xOffset}px`;
            templateStyle.height = `${height + yOffset}px`;
        } else {
            // piece template
            const templateStyle = piece.childNodes[0].style;
            templateStyle.width = `${width + xOffset}px`;
            templateStyle.height = `${height + yOffset}px`;
        }
        
    }
}

function createGrid() {
    const width = minWidth;
    const height = minHeight;

    jigsaw = new JigsawGrid();
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
    
    const serverContact = await fetch('/drawings', options);
    const result = await serverContact.json();
    drawings.push(...result);
    createGrid();
}


getDrawings().catch((err) => console.log(err));




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
const jigsawElement = document.getElementById('jigsaw-content');

document.addEventListener('mousedown', function(ev) {
    if(document.getElementById('jigsaw-display').style.display === 'none') return;

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
        let topOffset = (jigsaw.ring(jigsaw.size - 1) - 1) * parseInt(jigsaw.getDOM(1).style.height);
        if((newTop >= -topOffset && newTop <= document.documentElement.clientHeight + topOffset)
            || (newTop < -topOffset && topDiff > 0)
            || (newTop > document.documentElement.clientHeight + topOffset && topDiff < 0))
        {
            jigsawElement.style.top = `${newTop}px`;
        }

        const leftDiff = ev.clientX - lastX;
        const newLeft = jigsawElement.offsetLeft + leftDiff;
        const leftOffset = (jigsaw.ring(jigsaw.size - 1) - 1) * parseInt(jigsaw.getDOM(1).style.width);
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
let currDrawing;
function changeCurrentDrawing(d) {    
    let newDrawing = currDrawing + d;
    if(newDrawing <= question) {
        newDrawing = jigsaw.grid.length - 1;
    } else if(newDrawing > jigsaw.grid.length - 1) {
        newDrawing = question + buffer;
    }

    // todo: account for gaps in the jigsaw
    while(jigsaw.getPiece(newDrawing) === null) {
        newDrawing = newDrawing + d;
        if(newDrawing <= question) {
            newDrawing = jigsaw.grid.length - 1;
        } else if(newDrawing > jigsaw.grid.length - 1) {
            newDrawing = question + buffer;
        }
    }

    switchPage(1, newDrawing);
}

function switchPage(state, d) {
    const jigsawDisplayStyle = document.getElementById('jigsaw-display').style;
    const drawingDisplayStyle = document.getElementById('drawing-display').style;

    if(state === 1) {
        jigsawDisplayStyle.display = 'none';
        drawingDisplayStyle.display = 'initial';

        currDrawing = d;
        const pieceDOM = jigsaw.getDOM(d);
        const pieceOBJ = jigsaw.getOBJ(d);

        // todo: this magic number went to the market
        document.getElementById('current-drawing-backdrop').src = `${jigsawTemplatePath}backdrop-${Math.floor(pieceOBJ.col / 3)}.svg`;
        document.getElementById('current-drawing-template').src = pieceDOM.childNodes[1].src;
        document.getElementById('current-drawing').src = pieceDOM.childNodes[0].src;
        document.getElementById('child-name').innerHTML = pieceOBJ.name;
        document.getElementById('save').href = pieceDOM.childNodes[0].src;
        document.getElementById('save').download = `${pieceOBJ.name}'s drawing'`;
    } else {
        jigsawDisplayStyle.display = 'initial';
        drawingDisplayStyle.display = 'none';
    }
}

let zoomState = false;
function switchZoom() {
    const pcStyle = document.getElementById('question-content').style;
    const weekStyle = document.getElementById('week').style;
    const questionStyle = document.getElementById('question').style;
    const zoomText = document.getElementById('zoom-text');
    if(!zoomState) {
        positionPieces(300, 300);
        pcStyle.width = '450px';
        pcStyle.height = '450px';
        weekStyle.fontSize = "45px";
        questionStyle.fontSize = "70px";
        zoomText.innerHTML = "Zoom Out";
        zoomState = true;
    } else {
        positionPieces(minWidth, minHeight);
        pcStyle.width = '180px';
        pcStyle.height = '180px';
        weekStyle.fontSize = "18px";
        questionStyle.fontSize = "28px";
        zoomText.innerHTML = "Zoom In";
        zoomState = false;
    }
}