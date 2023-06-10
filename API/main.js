var express = require("express")
var mysql = require("mysql")
var regression = require("regression")
var app = express()


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cse327'
})

con.connect((err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("connected !!")
    }
})

app.get("/fetchbyid/:studentid", (req, res) => {
    const fetchbyid = req.params.studentid;
    con.query('SELECT * FROM cse327.readingtimes where studentid=?', fetchbyid, (err, result) => {
        if (err) {
            console.log(err)
        } else {
            if (result.length == 0) {
                console.log("id not present");
            }
            else {
                console.log("result", result)
                var value = JSON.parse(JSON.stringify(result))

                var linearpoints = []
                var exponentialPoints = []
                for (i = 0; i < value.length; i++) {
                    //  for(i = 0; i< value.length; i++){
                    console.log("Page Number:")
                    console.log(value[i].page)
                    console.log("\nPage Partition part:")
                    console.log(value[i].section)
                    console.log("\nReading time in seconds:")
                    console.log(value[i].time)

                    console.log("\n\nComment by timming:")
                    if (value[i].time <= 0) {
                        console.log("Didn't attentive\n\n");
                    } else if (value[i].time <= 50) {
                        console.log("Reading Book carelessly\n\n");
                    } else {
                        console.log("Attentively read books\n\n");
                    }

                    //  var linearpoints = [[value[i].page,value[i].time]]
                    // if(value[i].section=='top'){
                    // linearpoints.push([parseInt(value[i].page), value[i].time])
                    // console.log("linear fit with linear points:\n")
                    // }

                    linearpoints.push([parseInt(value[i].page), value[i].time])
                    console.log("linear fit with linear points:\n")

                    // exponentialPoints.push([parseInt(value[i].page), value[i].time])
                    // console.log("linear fit with exponential points:\n")

                    //  var exponentialPoints = [[value[i].page,value[i].time],[value[i].page,value[i].time]]
                    //    var exponentialPoints = [[value[i].page,value[i].time],[value[i+1].page,value[i+1].time]]
                    //             console.log("\n\nlinear fit with exponential points:\n")
                    //          console.log(regression.linear(exponentialPoints))


                }
                console.log(linearpoints)
                console.log(regression.linear(linearpoints))

                //    console.log('\n\n')
                //    console.log("linear fit with exponential points:\n")
                // console.log(exponentialPoints)
                // console.log(regression.linear(exponentialPoints))
            }
        }
    })
})

app.listen(2000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log("on port 2000")
    }
})