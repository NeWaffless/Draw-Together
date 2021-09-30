function drawpad(p) {
    let canvasWidth = document.getElementById('pad-frame').offsetWidth - 9;
    let canvasHeight = document.getElementById('pad-frame').offsetHeight - 9;
    let drawing;
    let myGUI;

    const BrushType = {
        Brush: 'Brush',
        Eraser: 'Eraser'
    };

    let brush = {
        type: BrushType.Brush,
        size: 10
    };

    let colours = {
        brush: [255, 0, 0, 255],
        bg: 220
    };

    function canvasSetup() {
        // canvasWidth = p.windowWidth;
        // canvasHeight = p.windowHeight;
        p.createCanvas(canvasWidth, canvasHeight); // preferably adjust to div
        drawing = p.createGraphics(canvasWidth, canvasHeight);
        drawing.strokeWeight(brush.size);
        p.noStroke();
        p.background(colours.bg);
    }

    function guiSetup(){
        myGUI = new dat.GUI();
        myGUI.autoplace;
        myGUI.add(brush, 'type', BrushType);
        myGUI.add(brush, 'size', 1, 100, 1);
        myGUI.addColor(colours, 'brush');
    }

    p.setup = function() {
        canvasSetup();
        guiSetup();
    }

    function brushTypeAdjustments() {
        if(brush.type == BrushType.Brush) {
            drawing.stroke(colours.brush);
            p.fill(colours.brush);
        } else {
            p.stroke(0);
            p.fill(colours.bg);
            drawing.stroke(colours.bg);
        }
    }

    p.draw = function() {
        brushTypeAdjustments();
        p.background(colours.bg);
        p.image(drawing, 0, 0);
        if(p.mouseIsPressed) {
            drawing.strokeWeight(brush.size);
            drawing.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY);
        }
        p.ellipse(p.pmouseX, p.pmouseY, brush.size);
    }
}

new p5(drawpad, 'pad-frame');