const express = require("express");
const bodyParser = require("body-parser");
//const res = require("express/lib/response");
const date = require(__dirname + "/date.js");



const app = express();

let items =["buy Food","Cook Food","Eat Food"];
let workitems =[];

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req,res){
    var today = new Date();
    
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = today.toLocaleDateString("en-US",options);

   
res.render("list",{ listTitle: day, newListItems: items});
    
});

app.post("/",function(req,res){
 let  item = req.body.newItem;
 if(req.body.list === "work"){
items.push(item);
 }else{
res.redirect("/work");
 }
 item.push(item);

    res.redirect("/");
});

app.get("/work",function(req,res){
    res.render("list",{listTitle: "Work List", newListItems: workitems});
});



app.listen(3000,function(){
    console.log("Server started on port 3000");
});