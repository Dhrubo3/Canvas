const express = require("express");

const app = express();

app.get("/",function(request,response){
    // console.log(request);
    response.send("Hello");
});

app.get("/contact",function(req,res){
    res.send("Contact me at: mddhrubo038@gmail.com");
});

app.listen(2000,function(){
    console.log("Server started on port 20001");
});