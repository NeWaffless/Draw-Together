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
const uidPath = 'curr_uid.json';


app.listen(port, () => {
  console.log(`Example app listening at port localhost:${port}`)
});

app.use(express.static('../'));

if(!fs.existsSync(imgFolder)) {
  fs.mkdirSync(imgFolder);
}

function createFile(newPath, data) {
  fs.writeFileSync(newPath, JSON.stringify(data), 'utf8', (fsErr) => {
    if(fsErr) throw fsErr;
  });
}

// change '/finish' to something more meaningful
app.post('/finish', (request, response) => {

  console.log('Drawing submission request from:  ' + request.body.uid);
  const data = request.body;

  let newPath = imgFolder + data.uid + '.json';

  // system for waffl user <- effectively infinite drawings
  if(data.uid === "waffl") {
    newPath = imgFolder + data.uid + '_' + Math.floor(Math.random() * 1000000).toString() + '.json';
    createFile(newPath, data.drawStr);
    response.json({status: 'success'});

  } else {
    if(!fs.existsSync(newPath)) {
      createFile(newPath, {col: data.col, drawStr: data.drawStr});

      response.json({status: 'success'});
    } else {
      console.log("-- EXISTS  for user -- " + data.uid + '\n');
      response.json({status: 'exists'});
    }
  }
});

app.get('/drawings', (req, res) => {
  console.log('\nRequest to receive images');
  let drawings = [];
  fs.readdirSync(imgFolder).forEach(file => {
    drawings.push(JSON.parse(fs.readFileSync(imgFolder + file, 'utf8')));
  });
  
  console.log('Finished reading all files');
  console.log(drawings.length);

  res.send(drawings);
});

app.post('/login', (request, response) => {
  db.find({uid:request.body.uid}, function (err, res) {
    if(err) throw err;
    if(res.length > 0) {
      fs.writeFileSync(uidPath, JSON.stringify(res[0]), 'utf8', (fsErr) => {
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
app.get('/uid', (req, res) => {
  fs.readFile(uidPath, 'utf8', (fsErr, data) => {
    if(fsErr) throw fsErr;
    res.send(data);
  });
});