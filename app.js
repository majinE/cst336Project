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


app.get("/login", function(req, res) {
   res.render("login.ejs"); 
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