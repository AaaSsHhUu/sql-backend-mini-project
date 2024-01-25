const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const {v4 : uuidv4} = require("uuid");
app.use(methodOverride("_method"));

app.use(express.urlencoded({extended : true}));

const connection = mysql.createConnection({
  host : "localhost",
  user : "root",
  database : "delta_app",
  password : "ashu@2004"
})

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

app.get("/", (req,res)=>{
  let q = `SELECT COUNT(*) FROM user`;
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
      console.log(result)
      let count = result[0]["COUNT(*)"];
      res.render("home.ejs",{count});
    })
  }
  catch(err){
    console.log('Some error occured in DB');
  }
})

// Get user route
app.get("/user",(req,res)=>{
  let q = `SELECT * FROM user`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      res.render("showusers.ejs",{result});
    })
  }
  catch(err){
    res.send("Some error occured in DB");
  }
})

// Edit user route
app.get("/user/:id/edit", (req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      console.log(result);
      let user = result[0];
      res.render("edit.ejs",{user});
    })
  }
  catch(err){
    console.log("Some error occured in DB");
  }
})

// Update user route
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;
  let {username : newUsername,  password: formPass} = req.body;
  try{
    connection.query(q,(err,result)=>{
    let user = result[0];
    if(err) throw err;
    if(formPass != user.password){
       res.send("WRONG PASSWORD");
    }
    else{
      let q = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
      connection.query(q,(err, result)=>{
        if(err) throw err;
        res.redirect("/user");
      })
    }
    })
  }
  catch(err){
    res.send("Some error occured in DB");
  }
})

// Add new user
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
})

app.post("/user",(req,res)=>{
  let id  = uuidv4();
  let {username, email, password} = req.body;
  // console.log(id,username,email,password);
  let q = `InSERT INTO user VALUE('${id}','${username}','${email}','${password}')`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      res.redirect("/user");
    })
  }
  catch(err){
    res.render("Some error occured in DB");
  }
})

// Delete a user if they have entered correct email and password
app.get("/user/:id/delete",(req,res)=>{
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  connection.query(q,(err,result)=>{
    let data = result[0];
    console.log(data);
    res.render("delete.ejs",{data});
  })
})

app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let q =  `SELECT * FROM user WHERE id = '${id}'`;
  let {userEmail,userPass} = req.body;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let data = result[0];
      let q = `DELETE FROM user where id='${id}'`;

      if(userPass === data.password && userEmail === data.email){
        connection.query(q,(err,result)=>{
          if(err) throw err;
          res.redirect("/user");
        })
      }
      else{
        // console.log(userEmail,userPass,data.email,data.password);
        res.send("Invalid Email Or Password");
      }
    })
  }
  catch(err){
    res.send("Some error occured in DB");
  }
  
})

// Search route
app.get("/user/search",(req,res)=>{
  let {search} = req.query;
  console.log(search);
  let q = `SELECT * from user where email = '${search}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let data = result[0];
      res.render("search.ejs",{data});
    })
  }
  catch(err){
    res.send("Some error occured in DB");
  }
})


app.listen("8080", ()=>{
  console.log(`Server is Listening to port 8080`);
})

// we don't have to call connection.end() as connection is getting ended automatically after the try block code has been executed.