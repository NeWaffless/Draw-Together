function drawpad(p) {
    const canvasWidth = document.getElementById('pad-frame').offsetWidth - 9;
    const canvasHeight = document.getElementById('pad-frame').offsetHeight - 9;

    let drawing, overlay;
    let myGUI; // to be removed
    let canvasToSave;

    let newBackground;

    let history;
    let histSize = 10;
    let backgroundToCopy;


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

    const channels = 4;

    const BrushType = {
        Brush: 'Brush',
        Eraser: 'Eraser'
    };

    let brush = {
        type: BrushType.Brush,
        size: 10,
        colour: [0, 0, 0, 255]
    };

    const allColours = Object.keys(colours);
    let bgCol = [255, 255, 255, 255];
    let bgInd = 0;


    // ---------------------- TESTING VARIABLES ---------------------- //



    // ---------------------- END TESTING VARIABLES ---------------------- //


    function canvasSetup() {
        p.createCanvas(canvasWidth , canvasHeight); // preferably adjust to div
        drawing = p.createGraphics(canvasWidth, canvasHeight);
        drawing.strokeWeight(brush.size);
        p.noStroke();
        // pick colour randomly here
        bgInd = Math.floor(Math.random() * mainColours) * shades + Math.floor(Math.random() * shades);
        bgCol = colours[allColours[bgInd]];
        p.background(bgCol);
    }

    function guiSetup(){
        newBackground = new ChangeBG();
        
        canvasToSave = new SaveClass();
        let myGUI = new dat.GUI();
        myGUI.autoplace;
        myGUI.add(brush, 'type', BrushType);
        myGUI.add(newBackground, 'NewBackground');
        myGUI.add(canvasToSave, 'SaveDrawing');
    }

    function historySetup() {
        backgroundToCopy = p.createGraphics(canvasWidth, canvasHeight);
        backgroundToCopy.background(bgCol);
        history = new HistoryBuffer(histSize);
        for(let i = 0; i < history.size + 1; i++) {
            history.arr[i] = p.createImage(canvasWidth, canvasHeight);
        }
        history.arr[0] = backgroundToCopy.get();
    }

    p.setup = function() {
        // restricts density to speed up background change processing
            // high density displays have 4x the amount of pixels
        p.pixelDensity(1);
        canvasSetup();
        guiSetup();
        historySetup();
        // for(let property in colours) {
        // 	console.log(typeof(property));
        // 	console.log(colours[property]);
        // }
    }

    function brushTypeAdjustments() {
        currCol = brush.colour;
        if(brush.type == BrushType.Eraser) {
            currCol = bgCol;
        }
        
        drawing.stroke(currCol);
        p.fill(currCol);
    }

    function undo() {
        let canUndo = history.undo();
        if(canUndo) {
            drawing.copy(backgroundToCopy, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
            drawing.copy(history.arr[history.ptr], 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
        }
    }

    p.draw = function() {
        brushTypeAdjustments();
        p.background(bgCol);
        p.image(drawing, 0, 0);
        if(p.mouseIsPressed && p.mouseButton == p.LEFT) {
            drawing.strokeWeight(brush.size);
            drawing.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        }
        p.ellipse(p.pmouseX, p.pmouseY, brush.size); // redundant for touchscreen <-- if possible register when users hand is hovering without touching?
    }

    p.mouseReleased = function() {
        history.add();
        history.arr[history.ptr] = drawing.get(); // passing drawing into a function doesn't work because :shrug:
    }

    p.keyPressed = function() {
        // replace with button
        if(p.keyCode == p.LEFT_ARROW) {
            undo();
        }
    }

    class ChangeBG {
        // borrows code from p5.js filter(THRESHOLD)
            // adjusted to change to a particular colour, as opposed to black and white
        recolourErasedPixels() {
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
        
        NewBackground() {
            // put background selection
                // either dropdown
                // button that scrolls through colours
            bgInd = (bgInd + 1) % allColours.length;
            
            // bgInd = Math.floor(Math.random() * mainColours) * shades + Math.floor(Math.random() * shades);
            bgCol = colours[allColours[bgInd]];
            this.recolourErasedPixels();
            backgroundToCopy.background(bgCol);
        }
    }

    class SaveClass {
        SaveDrawing() {
            p.background(bgCol);
            p.image(drawing, 0, 0);
            p.saveCanvas(drawing, 'my_drawing', 'png');
        }
    }
}

new p5(drawpad, 'pad-frame');