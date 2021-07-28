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
app.get("/dakomm", (req,res) => {
  // console.log(req.body.num);
  console.log("I'm D.A.Komm");
  // var ans = 10 * req.body.num;
  return res.json("I'm D.A.Komm! HI!");
});

app.get("/dbtest", async (req,res)=>{
  var rtnval = await mysqlConnection("SELECT * FROM laptopforhome.listdata;");
  return res.json(rtnval);
});

app.post("/api/membersinfo/chkuserinfo", async (req,res)=> {
  var rtnval = await mysqlConnection("SELECT * FROM laptopforhome.membersinfo WHERE(`user_id`="+req.body.id+");");
  console.log("*QUERY: "+"SELECT * FROM laptopforhome.membersinfo WHERE(`user_id`="+req.body.id+");");
  if(!rtnval){
    return res.json(rtnval);
  }else{
    return res.json(rtnval[0].user_name);
  }
});

app.get("/api/listdata/readdb", async (req,res)=> {
  var rtnval = await mysqlConnection("SELECT * FROM laptopforhome.listdata;")
  console.log("*QUERY: "+"SELECT * FROM laptopforhome.listdata;");
  return res.json(rtnval);
});

app.post("/api/listdata/insert", async (req,res)=> {
  var rtnval = await mysqlConnection("INSERT INTO laptopforhome.listdata(id, num, date, getter)"+
                                     " VALUES ('"+req.body.id+"','"+req.body.num+"','"+req.body.date+"','"+req.body.getter+"');")
  console.log("*QUERY: "+"INSERT INTO laptopforhome.listdata(id, num, date, getter)"+
  " VALUES ("+req.body.id+",'"+req.body.num+"','"+req.body.date+"','"+req.body.getter+"');");

  return res.json(rtnval);
});

app.post("/api/listdata/delete", async (req,res)=> {
  var rtnval = await mysqlConnection("DELETE FROM laptopforhome.listdata WHERE num="+req.body.num+";"
                                     +"SET @CNT=-1;" + "UPDATE listdata SET listdata.id=@CNT:=@CNT+1;")
  console.log("*QUERY: "+"DELETE FROM laptopforhome.listdata WHERE num="+req.body.num+";"
  +"SET @CNT=-1;" + "UPDATE listdata SET listdata.id=@CNT:=@CNT+1;");

  return res.json(rtnval);
});


app.listen(PORT, ()=> console.log(`running on port ${PORT}`));