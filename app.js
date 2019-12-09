const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js


app.get("/", function(req, res){
   res.render("index.ejs");
   
});


app.get("/male", async function(req, res){
    let colors = await getColors("Male");
    let clothingTypes = await getClothingType("Male");
    let maleProducts = await getAllProducts("Male");
    res.render("male", {"colors":colors, "types":clothingTypes, "products":maleProducts});
});

app.get("/female", async function(req, res){
    let colors = await getColors("Female");
    let clothingTypes = await getClothingType("Female");
    let femaleProducts = await getAllProducts("Female");
    res.render("female", {"colors":colors, "types":clothingTypes, "products":femaleProducts});
});

app.get("/maleResults", async function(req, res){
    let query = req.query;
    let colors = await getColors("Male");
    let clothingTypes = await getClothingType("Male");
    let maleProducts = await getFilteredProducts("Male", query);
    res.render("maleResults", {"colors":colors, "types":clothingTypes, "products":maleProducts});
});

app.get("/femaleResults", async function(req, res){
    let query = req.query;
    let colors = await getColors("Female");
    let clothingTypes = await getClothingType("Female");
    let femaleProducts = await getFilteredProducts("Female", query);
    res.render("femaleResults", {"colors":colors, "types":clothingTypes, "products":femaleProducts});
});




app.get("/cart", function(req, res){
    res.render("cart.ejs");
});


app.get("/items",async function(req, res) {
        if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
      //this is where the data will be retrieved from the database where you can add or delete items
      //grab all items from mysql
      let Fproducts = await getAllProducts("male");
      let Mproducts = await getAllProducts("female");
      res.render("items",{"Mproducts":Mproducts,"Fproducts":Fproducts});
    }else { 
    
       res.render("login"); 
   
   }
});

app.get("/addItems",function(req, res) {
    if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
        //this is where we are going to add items to the database
        res.render("newItem");
        
    }else { 
    
       res.render("login"); 
   
   }
});
app.post("/addItems", async function(req, res){
  //res.render("newAuthor");
  if (req.session.authenticated) { //if user hasn't authenticated, sending them to login screen
      let rows = await insertItem(req.body);
      console.log(rows);
      //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
      let message = "Item WAS NOT added to the database!";
      if (rows.affectedRows > 0) {
          message= "Item successfully added!";
      }
      res.render("newItem", {"message":message});
   }  else { 
       res.render("login"); 
   }
    
});

app.get("/login", function(req, res) {
    res.render("login");
    
});

function deleteItemM(uniqueId){
     let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM MaleProducts
                      WHERE uniqueId = ?`;
        
           conn.query(sql, [uniqueId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function insertItem(body) {
     let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO MaleProducts
           (typeClothing,price,color, imageLink)
           VALUES (?,?,?,?)`;
        
           let params = [body.type, body.price, body.color, body.link];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

app.get("/logout",function(req, res) {
   req.session.destroy();
   res.redirect("/");//taking the user back to the login screen
});

function getColors(gender){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT DISTINCT color
                      FROM ${gender}Products
                      ORDER BY color`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

function getClothingType(gender){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT DISTINCT typeClothing
                      FROM ${gender}Products
                      ORDER BY typeClothing`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise
}

function getAllProducts(gender){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
        
          let params = [];
        
          let sql = `SELECT uniqueId, price, imageLink
                     FROM ${gender}Products`;
        
          console.log("SQL:", sql);
          conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
          console.log("done");
        
        });//connect
    });//promise
    
}

function getFilteredProducts(gender, query){
    
    let conn = dbConnection();
    
    let type = query.type;
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
          if (err) throw err;
          console.log("Connected!");
        
          let params = []; 
        
          let sql = `SELECT uniqueId, price, imageLink
                     FROM ${gender}Products
                     WHERE
                     typeClothing LIKE '${type}'`;
          if(query.color){
              sql += " AND color = ?";
              params.push(query.color);
          }
          if(query.price){
              sql += " AND price <= ?";
              params.push(query.price);
          }
          console.log("SQL:", sql);
          conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
          });
          console.log("done");
        
        });//connect
    });//promise
    
}

function dbConnection(){

   let conn = mysql.createConnection({
                 host: "cst336db.space",
                 user: "cst336_dbUser26",
             password: "qse9zc",
             database: "cst336_db26"
       }); //createConnection

return conn;

}

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});