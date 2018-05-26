const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
const mysqlssh = require("mysql-ssh");
const config = require("./config.js"); //import connection data
var cors = require('cors');
var locks = require('locks');
var mutex = locks.createMutex();
var unlocktimer;

app.use(cors());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Make Connection
function connection() {
  return mysqlssh.connect(
    {
      host: config.sshpw.host,
      port: config.sshpw.port,
      username: config.sshpw.username,
      password: config.sshpw.password
    },
    {
      host: config.sqlpw.host,
      user: config.sqlpw.user,
      password: config.sqlpw.password,
      database: config.sqlpw.database
    }
  );
}

//Test Connection
connection()
  .then(client => {
    client.query("SELECT * FROM Trains", function(err, results, fields) {
      if (err) throw err;
      console.log(results[0]);
      mysqlssh.close();
    });
  })
  .catch(err => {
    console.log(err);
  });

//Get Stations
app.get("/stations", function(req, res) {
  let q = "SELECT * FROM Stations";
  let result = [];
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.log("STATIONQUERY: " + err);
        if (data) result = data;
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("STATIONS: " + err);
    });
});

//Get Checkout Information
app.get("/getCheckout", function(req, res) {
  let q = 'select a.train_id, travel_date as date, start_station, st1.station_name as start_name, s1.time_out as start_time, end_station, st2.station_name as end_name, s2.time_in as end_time, fare';
  q += ' from avail_trains a left join stops_at s1 on a.train_id=s1.train_id and a.start_station=s1.station_id';
  q += ' join stops_at s2 on a.train_id=s2.train_id and a.end_station=s2.station_id';
  q += ' join Stations st1 on a.start_station=st1.station_id';
  q += ' join Stations st2 on a.end_station=st2.station_id';
  q += ' where chosen=1;';
  let result = {};
  console.log("CHECKOUT: " + q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("CHECKOUTQUERY: " + err);
        if (data[0]) result = data[0];
        console.log('CC: '+JSON.stringify(result));
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("CHECKOUT: " + err);
    });
});

//Get Stations
app.get("/unlock", function(req, res) {
  if (mutex.isLocked){
    clearTimeout(unlocktimer);
    mutex.unlock();
  }
  console.log('unlocked');
  res.end();
});

//Get Tickets to View
app.post("/viewTickets",function(req,res){
  let result = [];
  let q = "select trip_id, st1.station_name as start_name, st2.station_name as end_name, trip_train as train_id,"
  q += " s1.time_out as start_time, s2.time_in as end_time, trip_date as date, fare, discounttype, pet,p.passenger_fname as f_name,p.passenger_lname as l_name"
  q += " from Tickets tk inner join stops_at s1 on tk.trip_train=s1.train_id and tk.trip_starts=s1.station_id"
  q += " inner join stops_at s2 on tk.trip_train=s2.train_id and tk.trip_ends=s2.station_id"
  q += " inner join Stations st1 on tk.trip_starts=st1.station_id"
  q += " inner join Stations st2 on tk.trip_ends=st2.station_id"
  q += " inner join Passengers p on tk.passenger_id=p.passenger_id"
  q += " where p.passenger_email='"+req.body.email+"' and tk.cancelled=0 and tk.trip_date >= curdate();";
  console.log('ViewTickets: '+q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("VIEWTICKETS Q: " + err);
        if (data) result=data;
        res.send(JSON.stringify(result));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("VIEWTICKETS C: " + err);
    });
});

//Cancel Ticket
app.post("/cancelTicket",function(req,res){
  let trip_id = req.body.trip_id;
  let q = "call cancel_ticket("+trip_id+");";
  console.log(q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("CANCEL Q: " + err);
        console.log('CANCEL:'+JSON.stringify(data));
        res.end();
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("CANCEL C: " + err);
    });
});

//Hacky way to get around lock
app.post("/getTrains2",function(req,res){
  let date = req.body.date.toString().slice(0,10);
  let from = req.body.stationfrom;
  let to = req.body.stationto;
  let time = req.body.time;
  let day = ((req.body.day == 0 || req.body.day == 6) ? 'SSH' : 'MF' );
  let q = "call get_avail_trains('"+date+"','"+from+"','"+to+"','"+time+"','"+day+"',@some_trains);";
  let result = [];
  console.log(q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("AVAILTRAINSQ: " + err);
        console.log(data);
        q = 'select a.train_id, start_station, s1.time_out as start_time, end_station, s2.time_in as end_time, fare';
        q += ' from avail_trains a left join stops_at s1 on a.train_id=s1.train_id and a.start_station=s1.station_id';
        q += ' join stops_at s2 on a.train_id=s2.train_id and a.end_station=s2.station_id;';
        console.log(q);
        client.query(q, function(err, data) {
          if (err) console.error("AVAILTRAINSQ: " + err);
          if (data) result = data;
          console.log(data + "\nGETTRAINS2");
          res.send(JSON.stringify(result));
          mysqlssh.close();
        });
      });
    })
    .catch(err => {
      console.error("AVAILTRAINSC: " + err);
    });
});

//Submit Selection and Get Available Trains
app.post("/getTrains",function(req,res){
  mutex.timedLock(1000, function (error) {
    if (error){
      console.log('Timedout');
      res.send(JSON.stringify(['timedout']));
    }
    else{
    	console.log('We got the lock!');
      unlocktimer = setTimeout(function(){ mutex.unlock(); }, 600000);

      let date = req.body.date.toString().slice(0,10);
      let from = req.body.stationfrom;
      let to = req.body.stationto;
      let time = req.body.time;
      let day = ((req.body.day == 0 || req.body.day == 6) ? 'SSH' : 'MF' );
      let q = "call get_avail_trains('"+date+"','"+from+"','"+to+"','"+time+"','"+day+"',@some_trains);";
      let result = [];
      console.log(q);
      connection()
        .then(client => {
          client.query(q, function(err, data) {
            if (err) console.error("AVAILTRAINSQ: " + err);
            console.log(data);
            q = 'select a.train_id, start_station, s1.time_out as start_time, end_station, s2.time_in as end_time, fare';
            q += ' from avail_trains a left join stops_at s1 on a.train_id=s1.train_id and a.start_station=s1.station_id';
            q += ' join stops_at s2 on a.train_id=s2.train_id and a.end_station=s2.station_id;';
            console.log(q);
            client.query(q, function(err, data) {
              if (err) console.error("AVAILTRAINSQ: " + err);
              if (data) result = data;
              console.log(data);
              res.send(JSON.stringify(result));
              mysqlssh.close();
            });
          });
        })
        .catch(err => {
          console.error("AVAILTRAINSC: " + err);
        });
      }
  });
});


//Select Train to reserve
app.post("/selectTrain",function(req,res){
  let q = "update avail_trains set chosen=1 where train_id="+req.body.train_id+";";
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("SELECTTRAIN Q: " + err);
        console.log('SELECTTRAIN:'+data.info);
        res.send(JSON.stringify(data));
        mysqlssh.close();
      });
    })
    .catch(err => {
      console.log("SELECTTRAIN C: " + err);
    });
});

//Purchase Ticket
app.post("/purchaseTicket",function(req,res){
  let f_name = req.body.f_name;
  let l_name = req.body.l_name;
  let address = req.body.address;
  let email = req.body.email;
  let fare = req.body.fare;
  let discounttype = req.body.discounttype;
  let pet = req.body.pet;
  let q = "call get_ticket('"+f_name+"','"+l_name+"','credit','"+address+"','"+email+"',"+fare+",'"+discounttype+"',"+pet+",@trip_ok);";
  console.log(q);
  connection()
    .then(client => {
      client.query(q, function(err, data) {
        if (err) console.error("PURCHASE Q: " + err);
        console.log('PURCHASE:'+JSON.stringify(data));
        res.send(JSON.stringify(data));
        mysqlssh.close();
        clearTimeout(unlocktimer);
        mutex.unlock();
      });
    })
    .catch(err => {
      console.log("PURCHASE C: " + err);
    });
});

//Listen to Port
app.listen(process.env.PORT || 3001, function() {
  console.log("Server running on 3001");
});
