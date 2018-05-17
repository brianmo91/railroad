const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const React = require('react');
const mysqlssh = require('mysql-ssh');
const config = require('./config.js'); //import connection data

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));

//Make Connection
function connection(){
  return(
    mysqlssh.connect(config.sshpw,config.sqlpw)
  );
}

//Test Connection
connection().then(client => {
  client.query('SELECT * FROM Trains', function (err, results, fields) {
    if (err) throw err
    console.log(results);
    mysqlssh.close();
  })
})
.catch(err => {
  console.log(err)
});

//Listen to Port
app.listen(3001, function() {
    console.log("Server running on 3001");
});
