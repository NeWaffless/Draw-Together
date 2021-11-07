const uidElement = document.getElementById('uid');
const uidSubmit = document.getElementById('uid-submit');

/*
todo:
- check if user is currently logged in
    - run immediately upon start up
    - this is in the case a user reaches this screen when they shouldn't
- user feedback for bad input
*/

async function checkUID() {
    const uidToCheck = uidElement.value.toLowerCase();
    const data = {uid:uidToCheck};
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    const contact = await fetch('/sign-in', options);
    const result = await contact.json();
    
    if(result.status === 'success') {
        document.getElementById('error-text').style.display = "none";
        if(result.finishedDrawing) window.location.href = "/pages/landing-page.html";
        else window.location.href = "/pages/prompt.html";
    } else {
        document.getElementById('error-text').style.display = "initial";
        document.getElementById('error-text').innerHTML = `Student code '${uidToCheck}' was not found. Try again.`;
    }
}

const inputHandler = function(e) {
    if(uidElement.value.length === 5) {
        uidSubmit.onclick = function() { checkUID(); };
        uidSubmit.classList.add("submitHover");
    } else {
        uidSubmit.setAttribute('onclick', '');
        if(uidSubmit.className === "submitHover") {
            uidSubmit.classList.remove("submitHover");
        }
    }
}

uidElement.addEventListener('input', inputHandler);