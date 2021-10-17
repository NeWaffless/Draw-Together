const uidElement = document.getElementById('uid');
const uidSubmit = document.getElementById('uid-submit');

/*
TODO ~
  - check if user is currently logged in
    - run immediately upon start up
*/

async function checkUID() {
    const data = {uid:uidElement.value};
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    const contact = await fetch('/login', options);
    const result = await contact.json();
    
    if(result.status === 'success') {
        window.location.href = "/pages/drawpad.html";
    }
}


function submitClicked() {
    checkUID();
}

const inputHandler = function(e) {
    if(uidElement.value.length === 5) {
        // change button clickability
        // update button visuals
    }
}

uidElement.addEventListener('input', inputHandler);
// source.addEventListener('propertychange', inputHandler);