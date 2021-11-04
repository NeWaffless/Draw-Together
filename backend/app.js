const express = require('express');
const Datastore = require('nedb');
const fs = require('fs');



/*
todo:
  - change strings to formated strings
  - rearrange functions to make logical order
  - review how status' are sent through promises
    - integers, and maybe status is returned as part of the promise alongside / as part of the response?
  - optimise reading and writing files
  - rename Datastore to db
  - add Keagan Parker to db
  - change deprecated existsSync with fs.stat or fs.access
  - comment to explain sections of code & functions
  - clean up calls
*/



const app = express();
const port = 3000;
app.use(express.json({limit: '1mb'}));

const db = new Datastore('database.db');
db.loadDatabase();

// db.insert({uid: "uid", fname: "first name", sname: "surname"});

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

function hasDrawn(uid) {
  return fs.existsSync(imgFolder + uid + '.json');
}

app.get('/landing-page-state', (req, res) => {
  let data = {
    state: "0",
    name: ""
  };
  try {
    if(fs.existsSync(uidPath)) {
      const userData = fs.readFileSync(uidPath, 'utf8');
      data.name = JSON.parse(userData).fname;
      if(hasDrawn(JSON.parse(userData).uid)) {
        data.state = "2";
      } else {
        data.state = "1";
      }
    }
  } catch(err) {
    console.log("An error occured finding the user id file");
    data.state = "err";
  }
  
  res.send(data);
});

// todo: change '/finish' to something more meaningful
app.post('/finish', (request, response) => {

  console.log('Drawing submission request from:  ' + request.body.uid);
  const data = request.body;

  let newPath = imgFolder + data.uid + '.json';

  // system for waffl user <- effectively infinite drawings
    // this is for prototyping only, this is the dev user!!!
  if(data.uid === "waffl") {
    newPath = imgFolder + data.uid + '_' + Math.floor(Math.random() * 1000000).toString() + '.json';
  }
  
  if(!fs.existsSync(newPath)) {
    db.find({uid:data.uid}, function (err, res) {
      if(err) throw err;
      if(res.length > 0) {
        const name = res[0].fname + ' ' + res[0].sname;
        console.log(name);
        fs.appendFileSync(newPath, {name: name, col: data.col, drawStr: data.drawStr});
        console.log("Successfully created file for user: " + data.uid);
        response.json({status: 'success'});
      } else {
        console.log('Failed to find user name');
        response.json({status: 'failed'});
      }
    });
  } else {
    console.log("-- EXISTS  for user -- " + data.uid + '\n');
    response.json({status: 'exists'});
  }
});

// todo: change to something more meaningful
app.get('/drawings', (request, response) => {
  console.log('\nRequest to receive images');
  let drawings = [];
  fs.readdirSync(imgFolder).forEach(file => {
    drawings.push(JSON.parse(fs.readFileSync(imgFolder + file, 'utf8')));
  });
  
  console.log('Finished reading all files');
  console.log(drawings.length);

  response.send(drawings);
});

app.post('/sign-in', (request, response) => {
  const uid = request.body.uid;
  db.find({uid:uid}, function (err, res) {
    if(err) throw err;
    if(res.length > 0) {
      fs.writeFileSync(uidPath, JSON.stringify(res[0]), 'utf8', (fsErr) => {
        if(fsErr) throw fsErr;
      });

      const fd = hasDrawn(uid);
      response.json({
        status: 'success',
        finishedDrawing: fd
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

app.get('/is-signed-in', (req, res) => {
  const result = {exists: false};
  if(fs.existsSync(uidPath)) result.exists = true;

  res.send(result);
});

app.delete('/logout', (req, res) => {
  if(fs.existsSync(uidPath)) {
    fs.unlinkSync(uidPath);
  }
});