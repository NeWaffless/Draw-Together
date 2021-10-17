const express = require('express');
const Datastore = require('nedb');
const Filesystem = require('fs');

/*
TODO ~
  - change strings to formated strings
  - rearrange posts to make logical order
*/
const app = express();
const port = 3000;
app.use(express.json({limit: '1mb'}));

const db = new Datastore('database.db');
db.loadDatabase();

const imgFolder = './img_strings/';


app.listen(port, () => {
  console.log(`Example app listening at port localhost:${port}`)
});

app.use(express.static('../'));

if(!Filesystem.existsSync(imgFolder)) {
  Filesystem.mkdirSync(imgFolder);
}

function createFile(newPath, data) {
  Filesystem.appendFile(newPath, data, (err) => {
    if (err) throw err;
    console.log("Created file -- " + newPath);
  });
}

// change '/finish' to something more meaningful
app.post('/finish', (request, response) => {

  console.log('Request from:  ' + request.body.uid);
  const data = request.body;

  let newPath = imgFolder + data.uid + '.txt';

  // system for waffl user <- effectively infinite drawings
  if(data.uid === "waffl") {
    newPath = imgFolder + data.uid + '_' + Math.floor(Math.random() * 1000000).toString() + '.txt';
    createFile(newPath, data.drawStr);
    response.json({status: 'success'});

  } else {
    if(!Filesystem.existsSync(newPath)) {
      createFile(newPath, data.drawStr);

      response.json({status: 'success'});
    } else {
      console.log("-- EXISTS  for user -- " + data.uid + '\n');
      response.json({status: 'exists'});
    }
  }
});


app.post('/jigsaw', (request, response) => {
  console.log('\nRequest to receive image');

  Filesystem.readFile(imgFolder + request.body.uid + '.txt', 'utf8' , (err, data) => {
    if (err) throw err;
    response.json({
      status: 'success',
      drawStr: data
    });
  });  
});

app.post('/uidCheck', (request, response) => {
  db.find({uid:request.body.uid}, function (err, res) {
    if(res.length > 0) {
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