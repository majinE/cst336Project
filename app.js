const express = require("express");
const mysql   = require("mysql");
const session = require("express-session");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded());
app.use(session({ secret: 'any', cookie:{ maxAge: 60000}}));


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

app.post("/loginProcess", async function(req,res){
    //console.log(req.body.username);
    
    let result = await getPassword(req.body.username);
    
    let password = "";
    if(result.length > 0){
        password = result[0].password;
    }
    
    if(req.body.password == password){
        req.session.authenticated = true;
        res.send({"loginSuccess":true});
        //console.log("success");
    }else{
        res.send(false);
        //console.log("fail");
    }
});

app.get("/admin", async function(req, res){
    
    if(req.session.authenticated){//if user hasn't authenticated, sending them to the login page
    
        let maleProducts = await getAllProducts("Male");
        
        let femaleProducts = await getAllProducts("Female");
        
        res.render("admin", {"maleProducts":maleProducts, "femaleProducts":femaleProducts});
        
    }else{
        
        res.redirect("/login");
        
    }

 });//admin
 
app.get("/addItem", function(req, res){
    
    if(req.session.authenticated){//if user hasn't authenticated, sending them to the login page
    
        res.render("newItem");
        
    }else{
        
        res.redirect("/login");
        
    }
    
});//addAuthor

app.post("/addItem", async function(req, res){
    
    if(req.session.authenticated){//if user hasn't authenticated, sending them to the login page
    
        //console.log(req.body);
        let rows = await insertItem(req.body);
        //console.log(rows);
        let message = "Item WAS NOT added to the database!";
        if(rows.affectedRows > 0){
            message = "Item successfully added!"
        }
        res.render("newItem", {"message": message});;
        
    }else{
        
        res.redirect("/login");
        
    }
    
});//root

app.get("/updateItem", async function(req, res){
    
    if(req.session.authenticated){//if user hasn't authenticated, sending them to the login page
    
        let uniqueId = req.query.uniqueId;
    
        let gender = req.query.gender;
        
        let itemInfo = await getItem(uniqueId, gender);
        
        res.render("updateItem", {"itemInfo" : itemInfo, "gender" : gender});
        
    }else{
        
        res.redirect("/login");
        
    }

});//admin

app.post("/updateItem", async function(req, res){
    
     if(req.session.authenticated){//if user hasn't authenticated, sending them to the login page
    
        let rows = await updateItem(req.body);
    
        //console.log(req.body);
        
        let uniqueId = req.query.uniqueId;
        
        let gender = req.query.gender;
        
        let itemInfo = await getItem(uniqueId, gender);
        
        //console.log(itemInfo);
        
        let message = "Item WAS NOT updated!";
        if(rows.affectedRows > 0){
            message = "Item successfully updated!"
        }
        
        res.render("updateItem", {"message" : message, "itemInfo" : itemInfo, "gender" : gender});
        
    }else{
        
        res.redirect("/login");
        
    }

});//admin

app.get("/deleteItem", async function(req,res){
    
    let rows = await deleteItem(req.query.uniqueId, req.query.gender);
    
    console.log(rows);
    let message = "Author WAS NOT deleted!";
    if(rows.affectedRows > 0){
        message = "Author was successfully deleted!";
    }
        
    let maleProducts = await getAllProducts("Male");
    
    let femaleProducts = await getAllProducts("Female");
        
    res.render("admin", {"maleProducts":maleProducts, "femaleProducts":femaleProducts});
    
});

app.get("/logout",function(req, res) {
   req.session.destroy();
   res.redirect("/");//taking the user back to the login screen
});

function insertItem(body){
    
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err){
            if(err) throw err;
            console.log("Connected!");
            
            let sql = `INSERT INTO ${body.gender}Products
                        (typeClothing, price, color, imageLink)
                        VALUES (?,?,?,?)`;
            let params = [body.type, body.price, body.color, body.link];
            
            conn.query(sql, params, function(err, rows, field){
                if(err) throw err;
                conn.end();
                resolve(rows);
            });
        });
    });//Promise
}

function updateItem(body){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err){
            if(err) throw err;
            console.log("Connected!");
            
            let sql = `UPDATE ${body.gender}Products SET 
                            typeClothing = ?,
                            price = ?,
                            color = ?,
                            imageLink = ?
                        WHERE uniqueId = ?`;
            let params = [body.type, body.price, body.color, body.link, body.itemId];
            
            conn.query(sql, params, function(err, rows, field){
                if(err) throw err;
                conn.end();
                resolve(rows);
            });
        });
    });//Promise
}

function getPassword(username){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                      FROM Administrator
                      WHERE username = ?`;
        
           conn.query(sql, [username], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function getItem(uniqueId, gender){
    let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                      FROM ${gender}Products
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

function deleteItem(uniqueId, gender){
     let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM ${gender}Products
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