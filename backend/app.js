const express = require('express');
const Datastore = require('nedb');
const fs = require('fs');



const app = express();
const port = 3000;
app.use(express.json({limit: '1mb'}));

const db = new Datastore('database.db');
db.loadDatabase();

// insert statement to add users if needed (yes, this should be here)
// db.insert({uid: "uid", fname: "first name", sname: "surname"}); 

const imgFolder = './user_imgs/';
const uidPath = 'curr_uid.json';


// host application
app.listen(port, () => {
  console.log(`Draw together app hosted at port localhost:${port}`);
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

// get the current state the landing page should be in based on user information
app.get('/landing-page-state', (req, res) => {
  let data = {
    state: "0",
    name: "",
    drawing: ""
  };
  try {
    if(fs.existsSync(uidPath)) {
      const userData = JSON.parse(fs.readFileSync(uidPath, 'utf8'));
      data.name = userData.fname;
      if(hasDrawn(userData.uid)) {
        data.state = "2";
        data.drawing = fs.readFileSync(imgFolder + userData.uid + '.json', 'utf8');
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

// user submits drawing
app.post('/submit-drawing', (request, response) => {
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
        createFile(newPath, {name: name, col: data.col, drawStr: data.drawStr});
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

app.get('/get-all-user-drawings', (request, response) => {
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

// logs out user
app.delete('/logout', (req, res) => {
  if(fs.existsSync(uidPath)) {
    fs.unlinkSync(uidPath);
  }
});