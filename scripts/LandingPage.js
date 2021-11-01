function updatePage(pageState, name) {
    const logoutBtn = document.getElementById('logout');
    const mainText = document.getElementById('main-text');
    const actionBtn = document.getElementById('action-btn');
    const finishedText = document.getElementById('finished-drawing');
    
    // todo: this could probably be done better
    if(pageState === 1 || pageState === "1") {
        logoutBtn.style.display = "initial";
        mainText.innerHTML = `Hi <strong>${name}</strong>! Click the button below to start drawing.`;
        actionBtn.style.right = null;
        actionBtn.innerHTML = "Join activity";
        actionBtn.onclick = function() { window.location.href='prompt.html'; };
        finishedText.style.display = "none";
    } else if(pageState === 2 || pageState === "2") {
        logoutBtn.style.display = "initial";
        mainText.innerHTML = `Hi <strong>${name}</strong>! Click the button below to view your drawing.`;
        actionBtn.style.right = "15%";
        actionBtn.innerHTML = "Go To Jigsaw";
        actionBtn.onclick = function() { window.location.href='jigsaw.html'; };
        finishedText.style.display = "flex";
    } else {
        logoutBtn.style.display = "none";
        mainText.innerHTML = "Hi there! Click the button below to start drawing.";
        actionBtn.style.right = null;
        actionBtn.innerHTML = "Get Started";
        actionBtn.onclick = function() { window.location.href='sign-in.html'; };
        finishedText.style.display = "none";
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
    if(result.satus === "err") {
        console.log("Failed to retrieve state of page");
    } else {
        updatePage(result.state, result.name);
    }
}

async function logout() {
    const options = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    };
    
    fetch('/logout', options);
    // todo: maybe this should not redirect?
    window.location.href = 'sign-in.html';
}

getPageState();