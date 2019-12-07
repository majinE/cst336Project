const express = require("express");
const mysql   = require("mysql");

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js


app.get("/", function(req, res){
   res.render("index.ejs");
});


app.get("/male", function(req, res){
    res.render("male.ejs");
});

app.get("/login", function(req, res) {
   res.render("login.ejs"); 
});

//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});