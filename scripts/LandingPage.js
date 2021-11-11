/*
todo:
- wait for logout confirmation before changing page
*/

function updatePage(pageState, name, drawingObj) {
    const logoutBtn = document.getElementById('logout');
    const hello = document.getElementById('hello');
    const nextPageBtn = document.getElementById('next-page');
    
    // todo: this could probably be done better
    if(pageState === 1 || pageState === "1") {
        logoutBtn.style.display = "initial";
        hello.style.display = "initial";
        document.getElementById('name').innerHTML = `${name}!`;
        nextPageBtn.innerHTML = "Join Activity";
        nextPageBtn.onclick = function() { window.location.href='prompt.html'; };
    } else if(pageState === 2 || pageState === "2") {
        if(drawingObj === "") throw console.error("Failed to get drawing");
        logoutBtn.style.display = "initial";
        hello.style.display = "initial";
        hello.innerHTML = `Hello <strong>${name}!</strong>`;
        document.getElementById('main').style.marginTop = '0';
        document.getElementById('bg').style.display = 'none';
        document.getElementById('name-container').style.display = 'none';
        document.getElementById('drawing-container').style.display = 'flex';
        document.getElementById('drawing').src = drawingObj.drawStr;
        document.getElementById('drawing-template').src = `../assets/jigsaw/jigsaw_pieces/${drawingObj.col}.svg`;
        document.getElementById('drawing-backdrop').src = `../assets/jigsaw/jigsaw_pieces/backdrop-${Math.floor(drawingObj.col / 3)}.svg`;
        nextPageBtn.innerHTML = "See Jigsaw";
        nextPageBtn.onclick = function() { window.location.href='jigsaw.html'; };
    }
}

async function getPageState() {
    const options = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    const serverContact = await fetch('/landing-page-state', options);
    const result = await serverContact.json();
    if(result.status === "err") {
        console.log("Failed to retrieve state of page");
    } else {
        let userDrawing;
        if(result.drawing === "") userDrawing = "";
        else userDrawing = JSON.parse(result.drawing);
        updatePage(result.state, result.name, userDrawing);
    }
}

getPageState();

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