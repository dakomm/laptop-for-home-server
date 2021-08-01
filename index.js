const express = require('express');
const app = express();
const mysql = require('mysql2/promise');
const PORT = process.env.port || 8000;
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const pool = mysql.createPool({
  connectionLimit: 10,
  waitForConnections: true,
  host: "localhost",
  user: "root",
  password: "H/KMC123",
  database: "laptopforhome",
  multipleStatements: true
});

/* FUNCTION */
/* MySQL Connection Service -------------------------------- */
const mysqlConnection = async (sqlQuery) => {
  try{
    let connection = await pool.getConnection(async conn=>conn);
    try{
      await connection.beginTransaction();
      let [rows] = await connection.query(sqlQuery);
      await connection.commit();
      connection.release();
      return rows;
    } catch(err){
      await connection.rollback();
      connection.release();
      console.log('*Query Error: '+err);
      return false;
    }
  } catch(err){
    console.log('*DB Error: '+err);
    return false;
  }
}

/* API */
/* Read DB from MySql -------------------------------- */
app.post("/api/membersinfo/chkuserinfo", async (req,res)=> {
  var rtnval = await mysqlConnection("SELECT * FROM laptopforhome.membersinfo WHERE(`user_id`="+req.body.id+");");
  console.log("*QUERY: "+"SELECT * FROM laptopforhome.membersinfo WHERE(`user_id`="+req.body.id+");");
  if(!rtnval || rtnval.toString() === ""){
    console.log("rtnval === false or []")
    return res.json(false);
  }else{
    return res.json(rtnval[0].user_name);
  }
});

app.post("/api/membersinfo/insert", async (req,res)=> {
  for(i=0;i<req.body.length;i++){
    console.log(req.body.length)
    var rtnval = await mysqlConnection("INSERT INTO laptopforhome.membersinfo(user_id, user_name)"+
                                      " VALUES ('"+req.body[i].id+"','"+req.body[i].name+"');")
    console.log("*QUERY: "+"INSERT INTO laptopforhome.membersinfo(user_id, user_name)"+
    " VALUES ('"+req.body[i].id+"','"+req.body[i].name+"');");
  }
  return res.json(rtnval);
});

app.get("/api/listdata/readdb", async (req,res)=> {
  var rtnval = await mysqlConnection("SELECT * FROM laptopforhome.listdata;")
  console.log("*QUERY: "+"SELECT * FROM laptopforhome.listdata;");
  return res.json(rtnval);
});

app.post("/api/listdata/insert", async (req,res)=> {
  var rtnval = await mysqlConnection("INSERT INTO laptopforhome.listdata(id, num, date, getter)"+
                                     " VALUES ("+req.body.id+",'"+req.body.num+"','"+req.body.date+"','"+req.body.getter+"');")
  console.log("*QUERY: "+"INSERT INTO laptopforhome.listdata(id, num, date, getter)"+
  " VALUES ("+req.body.id+",'"+req.body.num+"','"+req.body.date+"','"+req.body.getter+"');");

  return res.json(rtnval);
});

app.post("/api/listdata/delete", async (req,res)=> {
  var rtnval = await mysqlConnection('DELETE FROM laptopforhome.listdata WHERE id='+req.body.id+';'
                                     +"SET @CNT=-1;" + "UPDATE listdata SET listdata.id=@CNT:=@CNT+1;")
  console.log("*QUERY: "+'DELETE FROM laptopforhome.listdata WHERE id='+req.body.id+';'
  +"SET @CNT=-1;" + "UPDATE listdata SET listdata.id=@CNT:=@CNT+1;");

  return res.json(rtnval);
});

app.post("/api/listdata/listupbygetter", async (req,res)=> {
  var rtnval = await mysqlConnection('SELECT * FROM laptopforhome.listdata WHERE(`getter`="'+req.body.getter+'");');
  console.log("*QUERY: "+'SELECT * FROM laptopforhome.listdata WHERE(`getter`="'+req.body.getter+'");');
  if(!rtnval){
    console.log("rtnval === false")
    return res.json(rtnval);
  }else{
    var resultArray = JSON.parse(JSON.stringify(rtnval));
    return res.json(resultArray);
  }
});

app.post("/api/listdata/listupbynum", async (req,res)=> {
  var rtnval = await mysqlConnection('SELECT * FROM laptopforhome.listdata WHERE(`num`="'+req.body.num+'");');
  console.log("*QUERY: "+'SELECT * FROM laptopforhome.listdata WHERE(`num`="'+req.body.num+'");');
  if(!rtnval){
    console.log("rtnval === false")
    return res.json(rtnval);
  }else{
    var resultArray = JSON.parse(JSON.stringify(rtnval));
    console.log(resultArray)
    return res.json(resultArray);
  }
});


app.listen(PORT, ()=> console.log(`running on port ${PORT}`));