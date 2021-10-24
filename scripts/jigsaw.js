/*
    TODO ~
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
    - calculate grid size
    - make drawings append outwards
    - make 4 black tiles in centre squares
    - stop appending drawings once all drawings are placed
*/

// const grid = document.getElementById('img-grid');

const jigsawTemplatePath = '../assets/jigsaw_pieces/';
const drawingPath = '../backend/user_imgs/';
let drawings = [];

function createGrid() {
    const gridSize = Math.ceil(Math.sqrt(drawings.length));
    const total = drawings.length;
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


const grid = new JigsawGrid(8);
for(let i = 5; i <= 16; i++) {
    console.log(grid.gridPos(i));
}

// console.log(grid.gridPos(8));
