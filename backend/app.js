const express = require('express');
const Datastore = require('nedb');
const fs = require('fs');



/*
TODO ~
  - change strings to formated strings
  - rearrange functions to make logical order
  - review how status' are sent through promises
    - integers, and maybe status is returned as part of the promise alongside / as part of the response?
  - optimise reading a writing files
  - rename Datastore to db
*/



const app = express();
const port = 3000;
app.use(express.json({limit: '1mb'}));

const db = new Datastore('database.db');
db.loadDatabase();

const imgFolder = './user_imgs/';


app.listen(port, () => {
  console.log(`Example app listening at port localhost:${port}`)
});

app.use(express.static('../'));

if(!fs.existsSync(imgFolder)) {
  fs.mkdirSync(imgFolder);
}

function createFile(newPath, data) {
  fs.writeFile(newPath, JSON.stringify(data), 'utf8', (fsErr) => {
    if(fsErr) throw fsErr;
  });
}

// change '/finish' to something more meaningful
app.post('/finish', (request, response) => {

  console.log('Request from:  ' + request.body.uid);
  const data = request.body;

  let newPath = imgFolder + data.uid + '.json';

  // system for waffl user <- effectively infinite drawings
  if(data.uid === "waffl") {
    newPath = imgFolder + data.uid + '_' + Math.floor(Math.random() * 1000000).toString() + '.json';
    createFile(newPath, data.drawStr);
    response.json({status: 'success'});

  } else {
    if(!fs.existsSync(newPath)) {
      createFile(newPath, {drawStr: data.drawStr, col: data.col});

      response.json({status: 'success'});
    } else {
      console.log("-- EXISTS  for user -- " + data.uid + '\n');
      response.json({status: 'exists'});
    }
  }
});

app.post('/jigsaw', (request, response) => {
  console.log('\nRequest to receive image');

  fs.readFile(imgFolder + request.body.uid + '.json', 'utf8' , (err, data) => {
    if (err) throw err;
    const drawing = JSON.parse(data);
    response.json({
      status: 'success',
      data: drawing
    });
  });  
});

app.post('/login', (request, response) => {
  db.find({uid:request.body.uid}, function (err, res) {
    if(err) throw err;
    if(res.length > 0) {
      fs.writeFile('curr_uid.json', JSON.stringify(res[0]), 'utf8', (fsErr) => {
        if(fsErr) throw fsErr;
      });


      response.json({
        status: 'success'
      });
    } else {
      response.json({
        status: 'could not find'
      });
    }
  });
});

// get uid
// app.get('/uid')