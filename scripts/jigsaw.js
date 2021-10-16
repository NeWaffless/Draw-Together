const uidObj = {
    uid: 'testUID'
};

async function getDrawings() {
    // probably change this to GET
        // receive all drawings
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(uidObj)
    };
    const serverContact = await fetch('/jigsaw', options);
    const result = await serverContact.json();

    if(result.status === 'success') {
        document.getElementById('testUID-drawing').src = result.drawStr;
    }
}

getDrawings();