/*
    TODO ~
    - change variable names in function call to represent purpose
    - order drawing presentation (storing drawings with uid?)
    - get current users drawing to make it stand out / animate in
*/

const grid = document.getElementById('img-grid');

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

    result.forEach(drawing => {
        const node = document.createElement('img');
        node.src = drawing.drawStr;
        grid.appendChild(node);
    });
}

getDrawings();