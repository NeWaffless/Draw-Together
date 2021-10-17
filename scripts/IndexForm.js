const uidElement = document.getElementById('uid');
const uidSubmit = document.getElementById('uid-submit');

function submitClicked() {
    console.log(uidElement.value);
}

async function checkUID() {
    const data = {uid:uidElement.value};
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
    const contact = await fetch('/uidCheck', options);
    const result = await contact.json();
    
    console.log(result);
}

const inputHandler = function(e) {
    if(uidElement.value.length === 5) {
        checkUID();
    }
}

uidElement.addEventListener('input', inputHandler);
// source.addEventListener('propertychange', inputHandler);