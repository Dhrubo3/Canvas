const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const { decode } = require("punycode");
const {exec} = require("child_process");
const { stdout, stderr } = require("process");
const NodeWebcam = require( "node-webcam" );

const app = express();

const nodeWebCam = require('node-webcam');
const path = require('path');

app.use(express.static('images')) // images folder to be served
// Now we can just say localhost:3000/image.jpg

// specifying parameters for the pictures to be taken
var options = {
    width: 1280,
    height: 720, 
    quality: 100,
    delay: 5,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location"
};

// create instance using the above options
var webcam = nodeWebCam.create(options);

// capture function that snaps <amount> images and saves them with the given name in a folder of the same name
var captureShot = (amount, i, name) => {
 // Make sure this returns a real url to an image.
 return new Promise(resolve => {
    var path = `./images/${name}`;

    // create folder if and only if it does not exist
    if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
    } 

    // capture the image
    webcam.capture(`./images/${name}/${name}${i}.${options.output}`, (err, data) => {
        if(!err) {
            console.log('Image created')
        }
        console.log(err);
        i++;
        if(i <= amount) {
            captureShot(amount, i, name);
        }
        resolve('/path/to/image.jpg')
    }); 
 })

};

// call the capture function


app.get('/', (req, res) => {
    captureShot(5, 1, 'robin')
      .then((response) => { 
        // Whatever we resolve in captureShot, that's what response will contain
        console.log(response)
        res.send(`<img src="${response}"/>`)
    })
});




// app.get("/", (req, res)=>{
//     res.render("pdf")
// })

// app.post('/pdf', async (req, res) => {
//     const imgBase64 = req.body.imageBase64Data;
//     fs.writeFileSync('./public/woo.jpg', imgBase64);


// })




app.listen(3000, function(){
    console.log("Test Server Running")
})