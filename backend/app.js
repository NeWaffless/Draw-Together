const express = require('express');
const Datastore = require('nedb');
const Filesystem = require('fs');


const app = express();
const port = 3000;
app.use(express.json({limit: '1mb'}));

const database = new Datastore('database.db');
database.loadDatabase();


app.listen(port, () => {
  console.log(`Example app listening at port localhost:${port}`)
});

app.use(express.static('../'));


function createFile(newPath, data) {
  Filesystem.appendFile(newPath, data, (err) => {
    if (err) throw err;
    console.log("Created file -- " + newPath);
  });
}

app.post('/finish', (request, response) => {

  console.log('Request from:  ' + request.body.uid);
  const data = request.body;

  let newPath = './img_strings/' + data.uid + '.txt';

  // system for waffl user <- effectively infinite drawings
  if(data.uid === "waffl") {
    newPath = './img_strings/' + data.uid + '_' + Math.floor(Math.random() * 1000000).toString() + '.txt';
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

  Filesystem.readFile('./img_strings/' + request.body.uid + '.txt', 'utf8' , (err, data) => {
    if (err) throw err;
    response.json({
      status: 'success',
      drawStr: data
    });
  });  
});