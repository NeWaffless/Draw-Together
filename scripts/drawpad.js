/*
todo:
- refactor this shit
- maybe organise requests into files
- get it working with touch screen input (so that ipad mode works in chrome)
- wait for user call before allowing more button input
- potential browser / server error (something stalls the server processing)
*/


// todo: determine whether variables should be global or not!!
    // i.e. localise all these variables (this is seriously bad XD)
// canvas
let drawing;
let canDraw = true;
const canvasWidth = $(window).height() * 17 / 20;
const canvasHeight = $(window).height() * 17 / 20;
document.getElementById('pad-frame').style.width = `${canvasHeight - 1}px`;
document.getElementById('pad-frame').style.height = `${canvasHeight - 1}px`;
document.getElementById('btn-flex-container').style.height = `${canvasHeight * 4/5}px`;

// history <- used for undo
let history;
let histSize = 10;
let backgroundToCopy;
let incHistory = false;

// colours
    // most const variables below used to replace 'magic numbers'
const channels = 4;
const mainColours = 5;
const shades = 3;
const colours = {
    pink_dark: [251, 181, 206],
    pink_medium: [251, 199, 217],
    pink_light: [254, 209, 225],
    red_dark: [249, 124, 124],
    red_medium: [255, 141, 141],
    red_light: [255, 155, 155],
    yellow_dark: [246, 196, 81],
    yellow_medium: [254, 210, 108],
    yellow_light: [255, 218, 132],
    green_dark: [58, 160, 117],
    green_medium: [74, 171, 130],
    green_light: [89, 187, 145],
    blue_dark: [105, 158, 221],
    blue_medium: [121, 175, 238],
    blue_light: [140, 186, 239]
};
const allColours = Object.keys(colours);

// brush settings
const BrushType = {
    Brush: 'Brush',
    Eraser: 'Eraser'
};

let brush = {
    type: BrushType.Brush,
    size: 10,
    colour: [0, 0, 0, 255]
};

// background
let bgCol = [255, 255, 255, 255];
let bgMainInd = 0;
// todo: assign shaded version of colours to css
let bgShadeInd = 0;
let newBGInd = 0;


// todo: update this server call
let currUID = null;
function getUID() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    fetch('/uid', options).then(function(res) {
        res.json().then(function(res) {
            currUID = res.uid;
        });
    }, function(err) {
        throw err;
    });
}
getUID();
let drawingAsString = null;



let undoClicked = false;
let backgroundChangeClicked = false;
let saveClicked = false;

const brushButton = document.getElementById('pencil');
const eraserButton = document.getElementById('eraser');
const bgButton = document.getElementById('bg-btn');

function brushButtonEvent() {
    brush.type = BrushType.Brush;
    brush.size = 10;

    brushButton.style.alignSelf = 'center';
    eraserButton.style.alignSelf = 'flex-end';
}

function eraserButtonEvent() {
    brush.type = BrushType.Eraser;
    brush.size = 30;

    brushButton.style.alignSelf = 'flex-end';
    eraserButton.style.alignSelf = 'center';
}

function undoButtonEvent() {
    undoClicked = true;
}

function bgButtonEvent() {
    // move this code, it should be occur in this script
    const bgColours = document.getElementById('background-colours');
    const bgBackdrop = document.getElementById('colour-backdrop');
    if(bgColours.style.display == "none" || bgColours.style.display == "") {
        bgColours.style.display = "inline-block";
        bgBackdrop.style.display = "initial";
    } else {
        bgColours.style.display = "none";
        bgBackdrop.style.display = "none";
    }
}

function colourChange(newColInd) {
    if(newColInd != bgMainInd) {
        backgroundChangeClicked = true;
        newBGInd = newColInd;
        // todo: possibly remove <- based on user testing
        bgButtonEvent();
    }
}

async function finishConfirmed() {
    if(!drawingAsString) {
        console.log("No lines drawn");
        return;
    } else if (currUID === null) {
        console.log("No user id");
        return;
    }

    const dataToSend = {
        uid: currUID,
        drawStr: drawingAsString,
        col: (bgMainInd * shades) + bgShadeInd
    };

    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
    };

    const serverResponse = await fetch('/submit-drawing', options);
    const result = await serverResponse.json();
    if(result.status === 'success') {
        window.location.href = "jigsaw.html";
    } else {
        console.log('Could not submit user drawing');
    }
}


function drawpad(p) {
    function colToString(col) {
        // return 'rgb(' + col[0].toString() + ',' + col[1].toString() + ',' + col[2].toString() + ')';
        return `rgb(${col[0].toString()},${col[1].toString()},${col[2].toString()})`;
    }

    function canvasSetup() {
        p.createCanvas(canvasWidth , canvasHeight); // todo: preferably adjust to div
        drawing = p.createGraphics(canvasWidth, canvasHeight);

        // pick colour randomly here
        bgMainInd = Math.floor(Math.random() * mainColours);
        newBGInd = bgMainInd;
        bgShadeInd = Math.floor(Math.random() * shades);
        bgCol = colours[allColours[(bgMainInd * shades) + bgShadeInd]];

        p.background(bgCol);
        p.noStroke();
        drawing.background(bgCol);
        drawing.strokeWeight(brush.size);
        
        bgButton.style.backgroundColor = colToString(bgCol);
    }

    function historySetup() {
        backgroundToCopy = p.createGraphics(canvasWidth, canvasHeight);
        backgroundToCopy.background(bgCol);

        history = new HistoryBuffer(histSize);
        for(let i = 0; i < history.size + 1; i++) {
            history.arr[i].drawing = p.createImage(canvasWidth, canvasHeight);
            history.arr[i].col = bgCol;
        }
        history.arr[0].drawing = backgroundToCopy.get();
        history.arr[0].col = bgCol;
    }

    p.setup = function() {
        // restricts density to speed up background change processing
            // high density displays have 4x the amount of pixels
        p.pixelDensity(1);
        canvasSetup();
        historySetup();
    }

    // todo: can undo without having drawng, this changes the colour button
    function undo() {
        let canUndo = history.undo();
        if(canUndo) {
            drawing.copy(backgroundToCopy, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
            drawing.copy(history.arr[history.ptr].drawing, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
            bgCol = history.arr[history.ptr].col;
            bgButton.style.backgroundColor = colToString(history.arr[history.ptr].col);
        }
    }

    // this is fine, don't just my if statements
    function buttonChecks() {
        if(undoClicked) {
            undo();
            undoClicked = false;
        }
        if(backgroundChangeClicked) {
            newBackground(newBGInd);
            backgroundChangeClicked = false;
        }
    }

    function mouseOnCanvas() {
        if((p.mouseX >= 0 && p.mouseX <= canvasWidth) && (p.mouseY >= 0 && p.mouseY <= canvasHeight)) {
            return true;
        }

        return false;
    }

    function brushTypeAdjustments() {
        let currCol = brush.colour;
        if(brush.type == BrushType.Eraser) {
            currCol = bgCol;
        }
        
        drawing.stroke(currCol);
        p.fill(currCol);
    }

    p.draw = function() {
        buttonChecks();
        brushTypeAdjustments();
        p.background(bgCol);
        p.image(drawing, 0, 0);
        if(!canDraw) return;
        if(p.mouseIsPressed && p.mouseButton == p.LEFT) {
            drawing.strokeWeight(brush.size);
            drawing.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
            if(!incHistory && mouseOnCanvas()) {
                incHistory = true;
            }
        }
        p.ellipse(p.pmouseX, p.pmouseY, brush.size); // redundant for touchscreen <-- if possible register when users hand is hovering without touching?
    }

    // borrows code from p5.js filter(THRESHOLD)
        // adjusted to change to a particular colour, as opposed to black and white
    function recolourErasedPixels() {
        drawing.loadPixels();
        // in a perfect world where my code is perfect
            // 334 would be determined by picking the colour with the lowest rgb total and adding those numbers
            // instead, I did it manually because it is quicker
        let thresh = 334;
        for (let i = 0; i < canvasWidth * canvasHeight * channels; i += channels) {
            const r = drawing.pixels[i];
            const g = drawing.pixels[i + 1];
            const b = drawing.pixels[i + 2];
            const total = r + b + g;
            if (total > thresh) {
                drawing.pixels[i] = p.red(bgCol);
                drawing.pixels[i + 1] = p.green(bgCol);
                drawing.pixels[i + 2] = p.blue(bgCol);
            } else {
                drawing.pixels[i] = 0;
                drawing.pixels[i + 1] = 0;
                drawing.pixels[i + 2] = 0;
            }
        }
        drawing.updatePixels();
    }
    
    function newBackground(newInd) {
        // put background selection
            // either dropdown
            // button that scrolls through colours
        if(newInd < 0 || newInd > 4) return;
        if(bgMainInd == newInd) return;
        bgMainInd = newInd;
        
        bgCol = colours[allColours[(bgMainInd * shades) + bgShadeInd]];
        recolourErasedPixels();
        backgroundToCopy.background(bgCol);

        bgButton.style.backgroundColor = colToString(bgCol);

        saveDrawing();
    }

    function saveDrawing() {
        p.background(bgCol);
        backgroundToCopy.background(bgCol);
        p.image(drawing, 0, 0);
        drawingAsString = p.canvas.toDataURL();
    }

    p.mouseReleased = function() {
        if(incHistory) {
            history.add();
            history.arr[history.ptr].drawing = drawing.get(); // passing drawing into a function doesn't work because :shrug:
            history.arr[history.ptr].col = bgCol;
            incHistory = false;

            saveDrawing();

            const finishBtn = document.getElementsByClassName('finish-btn')[0];
            if(finishBtn.id === "") {
                finishBtn.onclick = function() { finishClicked(); };
                finishBtn.setAttribute("id", "finishOverride");
            }
        }
    }
}

// the linter is wrong
new p5(drawpad, 'pad-frame');

function finishClicked() {
    document.getElementById('finish-confirmation').style.display = 'flex';
    canDraw = false;
}

function finishCancelled() {
    document.getElementById('finish-confirmation').style.display = 'none';
    canDraw = true;
}