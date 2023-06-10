require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const PDFDocument = require('pdf-lib').PDFDocument;
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { check, validationResult } = require("express-validator");
const { Leopard } = require("@picovoice/leopard-node");
const { Op, col } = require("sequelize");
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });
const nodeWebCam = require("node-webcam");

var options = {
    width: 1280,
    height: 720, 
    quality: 100,
    delay: 1,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location"
};

var webcam = nodeWebCam.create(options);

var captureShot = (amount, i, name, id) => {
 return new Promise(resolve => {
    var path = `./public/userfaceid`;

    if(!fs.existsSync(path)) {
        fs.mkdirSync(path);
    } 

    // capture the image
    webcam.capture(`./public/userfaceid/${id}-${name.toLowerCase().split(" ").join("-")}-${i}.${options.output}`, (err, data) => {
        if(!err) {
            console.log('Image created')
        }
        console.log(err);
        i++;
        if(i <= amount) {
            captureShot(amount, i, name, id);
        }
        resolve(`./public/userfaceid/${id}-${name.toLowerCase().split(" ").join("-")}-${i-1}.${options.output}`)
    }); 
 })

};

async function LoadModels() {
    // Load the models
    // __dirname gives the root directory of the server
    await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models/faceapi");
    await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models/faceapi");
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models/faceapi");
}
LoadModels();


const handle = new Leopard(process.env.SPEECH_KEY);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, "./public/uploads/");
        }
        if (file.mimetype === "audio/mp3") {
            cb(null, "./public/audio/");
        }
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") + "-" + Date.now();
        cb(null, fileName + fileExt);
    }
})
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10000000 //10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else if (file.mimetype === "audio/mp3") {
            cb(null, true);
        } else {
            cb(null, false)
        }
    },
})

const sequelize = require("./util/database");
const User = require("./models/user");
const Student = require("./models/student");
const Teacher = require("./models/teacher");
const Cohort = require("./models/cohort");
const Cohort_Students = require("./models/cohort_students");
const Cohort_Subcohort = require("./models/cohort_subcohort");
const Content = require("./models/content");
const Quiz = require("./models/quiz");
const Mcq = require("./models/mcq");
const McqAnswer = require("./models/mcqanswer")
const Voice = require("./models/voice");
const Text = require("./models/text");
const TextAnswer = require("./models/textanswer")
const ReadingTime = require("./models/readingTime");
const Face = require("./models/face")
const { Console } = require('console');
const { json, text } = require('body-parser');
const { create } = require('domain');

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        console.log(user);
        cb(null, { id: user.id, userTypeId: null, name: user.name, userType: null, userImg: null });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/dashboard"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({
            where: { googleId: profile.id },
            defaults: {
                name: profile.displayName,
                email: profile.emails[0].value,
                profileImg: profile.photos[0].value
            },
        })
            .then(([user, created]) => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: "CSE327 Website Project",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/auth/google",
    passport.authenticate('google', {
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    }));

app.get("/auth/google/dashboard",
    passport.authenticate("google", { failureRedirect: "/" }),
    function (req, res) {
        res.redirect("/dashboard");
    });

app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        User.findOne({
            where: {
                id: req.user.id,
            }
        })
            .then(foundUser => {
                if (foundUser.userType === null) {
                    res.redirect("/newuser");
                } else {
                    if (foundUser.userType === "Student") {
                        Student.findOne({
                            where: {
                                userId: req.user.id
                            },
                            include: Cohort
                        })
                            .then(student => {
                                req.user.userTypeId = student.id;
                                req.user.userType = "Student";
                                req.user.userImg = foundUser.profileImg;
                                res.render("dashboard", { user: req.user, cohorts: student.cohorts });
                            })
                    }
                    else {
                        Teacher.findOne({
                            where: {
                                userId: req.user.id
                            },
                            include: Cohort
                        })
                            .then(teacher => {
                                req.user.userTypeId = teacher.id
                                req.user.userType = "Teacher"
                                req.user.userImg = foundUser.profileImg;
                                res.render("dashboard", { user: req.user, cohorts: teacher.cohorts });
                            })
                    }

                }
            })
    } else {
        res.redirect("/");
    }
});

app.get("/newuser", function (req, res) {
    if (req.isAuthenticated()) {
        if (req.user.userType === null) {
            res.render("newuser");
        } else {
            res.redirect("/dashboard")
        }
    } else {
        res.redirect("/")
    }
});

app.post("/newuser", [
    check("userType", "Please select a valid option")
        .exists()
        .isIn(["Teacher", "Student"])
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("newuser", { alert: errors.array() });
    } else {
        User.findOne({
            where: {
                id: req.user.id
            }
        })
            .then(user => {
                user.userType = req.body.userType;
                user.save();
                if (user.userType === "Student") {
                    Student.create({
                        userId: user.id
                    }, {
                        include: [{
                            association: Student.User
                        }]
                    })
                        .then(student => {
                            res.redirect("/dashboard");
                        })
                } else {
                    Teacher.create({
                        userId: user.id
                    }, {
                        include: [{
                            association: Teacher.User
                        }]
                    })
                        .then(teacher => {
                            res.redirect("/dashboard");
                        })
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
});


app.get("/newcohort", function (req, res) {
    if (req.isAuthenticated()) {
        if (req.user.userType === "Teacher") {
            Student.findAll({
                include: { model: User, required: true, attributes: ["name", "email"] }
            })
                .then(foundStudents => {
                    Cohort.findAll({
                        where: {
                            teacherId: req.user.userTypeId
                        }
                    })
                        .then(foundCohorts => {
                            res.render("newcohort", { students: foundStudents, cohorts: foundCohorts });
                        })
                })
        } else {
            res.redirect("/dashboard")
        }
    } else {
        res.redirect("/")
    }
})

app.post("/newcohort", [
    check("title")
        .isLength({ min: 1 }).withMessage("Please enter a title for your cohort")
        .isLength({ max: 30 }).withMessage("Title should be 3 to 30 characters"),
    check("description")
        .exists().withMessage("Please enter a short description")
        .isLength({ min: 1 }).withMessage("Please enter a short description")
        .isLength({ max: 100 }).withMessage("Keep the description short!! Max 100 characters"),
    check("students")
        .isLength({ min: 1 }).withMessage("Please select atleast one student for your cohort")
], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("error", { alert: errors.array() });
    } else {
        const newCohort = await Cohort.create({
            title: req.body.title,
            description: req.body.description,
            teacherId: req.user.userTypeId
        }, {
            include: [{
                association: Cohort.Teacher
            }]
        });
        for (var i = 0; i < req.body.students.split(",").length; i++) {
            const studentRow = await Student.findByPk(req.body.students.split(",")[i]);
            newCohort.addStudent(studentRow, { through: Cohort_Students });
        }
        for (var i = 0; i < req.body.cohorts.split(",").length; i++) {
            const cohortRow = await Cohort.findByPk(req.body.cohorts.split(",")[i]);
            newCohort.addSubCohort(cohortRow, { through: Cohort_Subcohort });
        }
        res.redirect("/dashboard")
    }
})

app.get("/cohort/:id", function (req, res) {

    if (req.isAuthenticated()) {
        Cohort.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: Content
            }, {
                model: Cohort,
                as: "subCohorts"
            }]
        })
            .then(cohort => {
                if (!cohort) {
                    return res.redirect("/dashboard");
                }
                if (req.user.userType === "Teacher") {
                    if (cohort.teacherId === req.user.userTypeId) {
                        res.render("cohort", { user: req.user, cohort: cohort })
                    } else {
                        res.redirect("/dashboard");
                    }
                }
                if (req.user.userType === "Student") {
                    Cohort_Students.findOne({
                        where: {
                            studentId: req.user.userTypeId,
                            cohortId: req.params.id
                        }
                    })
                        .then(cohortHasStudent => {
                            if (!cohortHasStudent) {
                                res.redirect("/dashboard");
                            } else {
                                res.render("cohort", { user: req.user, cohort: cohort })
                            }
                        })
                }
            })
    } else {
        res.redirect("/")
    }
})

app.get("/cohort/:id/uploadcontent", function (req, res) {
    if (req.isAuthenticated()) {
        if (req.user.userType === "Teacher") {
            res.render("uploadcontent", { cohortId: req.params.id })
        } else {
            res.redirect("/dashboard")
        }
    } else {
        res.redirect("/")
    }
})

app.post("/:id/uploadcontent", upload.single("uploadFile"), [
    check("contentName")
        .isLength({ min: 1 }).withMessage("Please enter a name for the reading task")
        .isLength({ max: 30 }).withMessage("Content name should be 3 to 30 characters"),
    check("dueDateTime")
        .isLength({ min: 1 }).withMessage("Please select a due date and time for the task"),
], function (req, res) {
    const errors = validationResult(req);
    if (!req.file) {
        return res.render("error", { alert: [{ msg: "Please select a pdf file" }] });
    }
    if (!errors.isEmpty()) {
        if (req.file) {
            fs.unlink(req.file.path, function (err) {
                if (err) {
                    console.log(err);
                }
            })
        }
        return res.render("error", { alert: errors.array() });
    } else {
        Content.create({
            name: req.body.contentName,
            closeDate: req.body.dueDateTime,
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            cohortId: req.params.id
        }, {
            include: [{
                association: Content.Cohort
            }]
        })
            .then(async content => {
                const docmentAsBytes = await fs.promises.readFile(content.filePath);
                const pdfDoc = await PDFDocument.load(docmentAsBytes);
                const numberOfPages = pdfDoc.getPages().length;
                for (let i = 0; i < numberOfPages; i++) {
                    dir = "./public/uploads/" + content.fileName.replace(path.extname(content.fileName), "") + "-pageSection"
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }
                    newFileLocation = dir + "/" + content.fileName.replace(path.extname(content.fileName), "")
                    exec(`magick convert -density 120 ${content.filePath}[${i}] -quality 100 ${newFileLocation}-page${i + 1}.jpg`, (err, stdout, stderr) => {
                        if (err) {
                            console.log(err)
                        } else {
                            exec(`magick ${newFileLocation}-page${i + 1}.jpg +repage -write mpr:image +delete ^ ( mpr:image -crop 1275x825+0+0 +repage +write ${newFileLocation}-page${i + 1}Sectiontop.jpg ) ^ ( mpr:image -crop 1275x825+0+825 +repage +write ${newFileLocation}-page${i + 1}Sectionbottom.jpg ) ^ null:`, (err, stdout, stderr) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    fs.unlink(newFileLocation + "-page" + (i + 1) + ".jpg", function (err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    })
                                }
                            })
                        }
                    })

                }
                res.redirect("/cohort/" + req.params.id)
            });
    }
})

app.get("/:contentId/edittask", function (req, res) {
    if (req.isAuthenticated()) {
        if (req.user.userType === "Teacher") {
            Content.findByPk(req.params.contentId)
                .then(content => {
                    res.render("editcontent", { content: content })
                })
        } else {
            res.redirect("/dashboard")
        }
    } else {
        res.redirect("/")
    }
})

app.post("/:contentId/edittask", upload.single("uploadFile"), [
    check("contentName")
        .isLength({ min: 1 }).withMessage("Please enter a name for the reading task")
        .isLength({ max: 30 }).withMessage("Content name should be 3 to 30 characters"),
    check("dueDateTime")
        .isLength({ min: 1 }).withMessage("Please select a due date and time for the task"),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("error", { alert: errors.array() });
    } else {
        Content.findOne({
            where: {
                id: req.params.contentId
            }
        })
            .then(content => {
                content.name = req.body.contentName;
                content.closeDate = req.body.dueDateTime + ":00.000Z";
                if (req.file) {
                    fs.unlink(content.filePath, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                    content.fileName = req.file.filename;
                    content.originalFileName = req.file.originalname;
                    content.filePath = req.file.path;
                }
                content.save()
                res.redirect("/task/" + req.params.contentId)
            })
    }
})

app.get("/students", function (req, res) {
    res.render("studentlist", { user: req.user })
})

app.get("/task/:contentId", function (req, res) {
    if (req.isAuthenticated()) {
        Content.findByPk(req.params.contentId).then(content => {
            res.render("task", { user: req.user, task: content, contentId: req.params.contentId })
        })
    } else {
        res.redirect("/")
    }
});

app.get("/task/:contentId/page/:pageNum/section/:section", function (req, res) {
    if (req.isAuthenticated()) {
        Content.findByPk(req.params.contentId).then(async content => {
            const docmentAsBytes = await fs.promises.readFile(content.filePath);
            const pdfDoc = await PDFDocument.load(docmentAsBytes);
            const numberOfPages = pdfDoc.getPages().length;
            const folderName = content.fileName.replace(path.extname(content.fileName), "") + "-pageSection"
            const imgName = content.fileName.replace(path.extname(content.fileName), "") + "-page" + req.params.pageNum + "Section" + req.params.section + ".jpg"
            if (req.params.pageNum <= 0) {
                return res.redirect("/task/" + req.params.contentId + "/page/1/section/top");
            }
            else if (req.params.pageNum >= numberOfPages + 1) {
                return res.redirect("/task/" + req.params.contentId + "/page/" + numberOfPages + "/section/bottom");
            }
            res.render("page", { folderName: folderName, imgName: imgName, pageNum: req.params.pageNum, section: req.params.section, contentId: req.params.contentId, totalPage: numberOfPages })
        })
    } else {
        res.redirect("/")
    }
});

app.post("/task/:contentId/page/:pageNum/section/:section", function (req, res) {
    if (req.isAuthenticated() && req.user.userType === "Student") {
        console.log("dhrubo"+req.body.readingTime)
        ReadingTime.findOrCreate({
            where: {
                contentId: req.params.contentId,
                studentId: req.user.userTypeId,
                page: req.params.pageNum,
                section: req.params.section
            },
            defaults: {
                time: req.body.readingTime
            }
        }).then(([readingTime, created]) => {
            if (!created) {
                readingTime.time = parseInt(readingTime.time) + parseInt(req.body.readingTime)
                readingTime.save()
            }
        })
    } else {
        res.redirect("/")
    }
})

app.get("/:contentId/quiz", function (req, res) {
    if (req.isAuthenticated()) {
        Quiz.findAll({
            where: {
                contentId: req.params.contentId
            }
        }).then(quizzes => {
            res.render("quizzes", { user: req.user, quizzes: quizzes, contentId: req.params.contentId })
        })
    } else {
        res.redirect("/")
    }
})

app.get("/:contentId/createquiz", function (req, res) {
    res.render("createquiz", { contentId: req.params.contentId });
})

app.post("/:contentId/createquiz", function (req, res) {
    Quiz.findOrCreate({
        where: {
            name: req.body.quizName,
            contentId: req.params.contentId
        },
        defaults: {
            closeDate: req.body.dueDateTime,
            status: "Unpublished"
        },
    })
        .then(([quiz, created]) => {
            if (created) {
                return res.render("warning", { contentId: req.params.contentId });
            } else {
                return res.render("error", { alert: [{ msg: "Quizzes under the same task cannot have the same name" }] });
            }
        })
})

app.get("/:contentId/:quizId/mcqquestion", function (req, res) {
    Content.findByPk(req.params.contentId).then(async content => {
        const docmentAsBytes = await fs.promises.readFile(content.filePath);
        const pdfDoc = await PDFDocument.load(docmentAsBytes);
        const numberOfPages = pdfDoc.getPages().length;
        Mcq.findAll({
            where: {
                quizId: req.params.quizId
            }
        }).then(mcq => {
            console.log(JSON.stringify(mcq, null, 2))
            res.render("mcqquestion", { numberOfPages: numberOfPages, contentId: req.params.contentId, quizId: req.params.quizId, mcq: mcq });
        })
    })
})

app.post("/:contentId/:quizId/addmcq", function (req, res) {
    console.log(JSON.stringify(req.body, null, 2))
    console.log(req.body.question.length)
    console.log(req.body.optionA[1])
    for (var i = 0; i < req.body.question.length; i++) {
        Mcq.create({
            question: req.body.question[i],
            optionA: req.body.optionA[i],
            optionB: req.body.optionB[i],
            optionC: req.body.optionC[i],
            optionD: req.body.optionD[i],
            correctOption: req.body.correctOption[i],
            questionFromPage: req.body.page[i],
            questionFromSection: req.body.section[i],
            quizId: req.params.quizId
        }, {
            include: [{
                association: Mcq.Quiz
            }]
        })
    }
    res.redirect("/" + req.params.contentId + "/quiz")
})

app.get("/:contentId/:quizId/textquestion", function (req, res) {
    Content.findByPk(req.params.contentId).then(async content => {
        const docmentAsBytes = await fs.promises.readFile(content.filePath);
        const pdfDoc = await PDFDocument.load(docmentAsBytes);
        const numberOfPages = pdfDoc.getPages().length;
        Text.findAll({
            where: {
                quizId: req.params.quizId
            }
        }).then(text => {
            console.log(JSON.stringify(text, null, 2))
            res.render("textquestion", { numberOfPages: numberOfPages, contentId: req.params.contentId, quizId: req.params.quizId, text: text });
        })
    })
})

app.post("/:contentId/:quizId/addtext", function (req, res) {
    console.log(JSON.stringify(req.body, null, 2))
    console.log(req.body.question.length)
    console.log(req.body.question[1])
    for (var i = 0; i < req.body.question.length; i++) {
        Text.create({
            question: req.body.question[i],
            correctAnswer: req.body.correctAnswer[i],
            questionFromPage: req.body.page[i],
            questionFromSection: req.body.section[i],
            quizId: req.params.quizId
        }, {
            include: [{
                association: Text.Quiz
            }]
        })
    }
    res.redirect("/" + req.params.contentId + "/quiz")
})

app.get("/:contentId/:quizId/voicequestion", function (req, res) {
    Content.findByPk(req.params.contentId).then(async content => {
        const docmentAsBytes = await fs.promises.readFile(content.filePath);
        const pdfDoc = await PDFDocument.load(docmentAsBytes);
        const numberOfPages = pdfDoc.getPages().length;

        res.render("voicequestion", { numberOfPages: numberOfPages, contentId: req.params.contentId, quizId: req.params.quizId });
    })
})

app.post("/:contentId/:quizId/addvoice", upload.array("audio", 2), function (req, res) {
    var questionText
    var questionFileName
    var questionFilePath
    var answerText
    var answerFileName
    var answerFilePath
    for (var i = 0; i < req.files.length; i++) {
        if (i === 0) {
            const resultq = handle.processFile(req.files[i].path);
            questionText = resultq.transcript
            questionFileName = req.files[i].filename
            questionFilePath = req.files[i].path
        } else {
            const resulta = handle.processFile(req.files[i].path);
            answerText = resulta.transcript
            answerFileName = req.files[i].filename
            answerFilePath = req.files[i].path
        }
    }
    Voice.create({
        questionAudioFileName: questionFileName,
        questionAudioFilePath: questionFilePath,
        questionText: questionText,
        answerAudioFileName: answerFileName,
        answerAudioFilePath: answerFilePath,
        answerText: answerText,
        questionFromPage: req.body.page,
        questionFromSection: req.body.section,
        quizId: req.params.quizId
    }, {
        include: [{
            association: Voice.Quiz
        }]
    }).then(voice => {

    })
});

app.get("/task/:contentId/performquiz", function (req, res) {
    Quiz.findAll({
        where: {
            contentId: req.params.contentId
        },
        include: [
            {
                model: Mcq,
            },
            {
                model: Voice,
            },
            {
                model: Text,
            }
        ]
    }).then(quiz => {
        console.log(JSON.stringify(quiz, null, 2))
        console.log(quiz[0].mcqs.length)
        res.render("performquiz", {contentId: req.params.contentId ,quiz: quiz})
    })
})

app.get("/:contentId/:quizId/performmcq", function (req, res){
    Mcq.findAll({
        where:{
            quizId: req.params.quizId
        }
    }).then(mcq=>{
        res.render("answermcq", {mcq: mcq, contentId: req.params.contentId, quizId: req.params.quizId})
    })
})

app.post("/:contentId/:quizId/checkmcq", function (req, res) {
    var flag = 0;
    Mcq.findAll({
        where:{
            quizId: req.params.quizId
        }
    }).then(mcq=>{
        for (var i = 0; i < mcq.length; i++){
            McqAnswer.create({
                answer: req.body.choosenAnswer[i],
                status: "Empty",
                quizId: req.params.quizId,
                mcqId: mcq[i].id,
                studentId: req.user.userTypeId
            },{
                include: [
                    {association: McqAnswer.Quiz},
                    {association: McqAnswer.Mcq},
                    {association: McqAnswer.Student}
                ]
            }).then(mcqanswer => {
                if (req.body.choosenAnswer[flag] === mcq[flag].correctOption){
                    mcqanswer.status = "Correct"
                } else {
                    mcqanswer.status = "Wrong"
                }
                mcqanswer.save()
                flag++;
            })
        }
        res.redirect("result")
    })
})

app.get("/:contentId/:quizId/result", function (req, res) {
    McqAnswer.findAll({
        where:{
            studentId: req.user.userTypeId,
            quizId: req.params.quizId
        }
    }).then(mcqanswer => {
        McqAnswer.findAll({
            where:{
                studentId: req.user.userTypeId,
                quizId: req.params.quizId,
                status: "Correct"
            }
        }).then(correctanswer => {
            return res.render("result", {totalMarks: mcqanswer.length, obtainedMarks: correctanswer.length, contentId: req.params.contentId})
        })
    })
})

app.get("/:contentId/:quizId/performtext", function (req, res){
    Text.findAll({
        where:{
            quizId: req.params.quizId
        }
    }).then(text=>{
        res.render("answertext", {text: text, contentId: req.params.contentId, quizId: req.params.quizId})
    })
})

app.post("/:contentId/:quizId/checktext", function (req, res) {
    var flag = 0;
    Text.findAll({
        where:{
            quizId: req.params.quizId
        }
    }).then(text=>{
        for (var i = 0; i < text.length; i++){
            TextAnswer.create({
                answer: req.body.answer[i],
                status: "Empty",
                quizId: req.params.quizId,
                textId: text[i].id,
                studentId: req.user.userTypeId
            },{
                include: [
                    {association: TextAnswer.Quiz},
                    {association: TextAnswer.Text},
                    {association: TextAnswer.Student}
                ]
            }).then(textanswer => {
                if (req.body.answer[flag].toLowerCase() === text[flag].correctAnswer.toLowerCase()){
                    textanswer.status = "Correct"
                } else {
                    textanswer.status = "Wrong"
                }
                textanswer.save()
                flag++;
            })
        }
        res.redirect("textresult")
    })
})

app.get("/:contentId/:quizId/textresult", function (req, res) {
    TextAnswer.findAll({
        where:{
            studentId: req.user.userTypeId,
            quizId: req.params.quizId
        }
    }).then(textanswer => {
        TextAnswer.findAll({
            where:{
                studentId: req.user.userTypeId,
                quizId: req.params.quizId,
                status: "Correct"
            }
        }).then(correctanswer => {
            return res.render("result", {totalMarks: textanswer.length, obtainedMarks: correctanswer.length, contentId: req.params.contentId})
        })
    })
})

app.get("/:contentId/:quizId/completequizreport", function (req, res){
    Content.findByPk(req.params.contentId, {
        include : [
            {
                model: Cohort,
                include: [{
                    model: Student,
                }]
            }
        ]
    }).then(content => {
        console.log(JSON.stringify(content, null, 2));
        console.log("Total Students: " + content.cohort.students.length)
        ///// Need to find distinct studentId's by right joining mcqanswer voicanswer and textanswer thorugh quizId for total participating students
        Quiz.findByPk(req.params.quizId, {
            include : [
                {model: McqAnswer},
                // {model: VoiceAnswer},
                {model: TextAnswer},
            ]
        }).then(quiz=>{
            console.log(JSON.stringify(quiz, null, 2))
            var studentIds = [];
            quiz.McqAnswers.forEach(x => {
                studentIds.push(x.studentId)
            });
            quiz.textAnswers.forEach(x => {
                studentIds.push(x.studentId)
            });
            const participatingStudents = new Set(studentIds).size;
            console.log(studentIds)
            console.log("Number of students participated in the Quiz: " + participatingStudents)
            ///// Need to find distinct studentId's by right joining mcqanswer voicanswer and textanswer thorugh quizId for total correct students
            Quiz.findByPk(req.params.quizId, {
                include : [
                    {
                        model: McqAnswer,
                        where: {
                            status: "Correct"
                        },
                        required: true
                    },
                    // {
                    //     model: VoiceAnswer,
                    //     where: {
                    //         status: "Correct"
                    //     },
                    //     required: true
                    // },
                    {
                        model: TextAnswer,
                        where: {
                            status: "Correct"
                        },
                        required: true
                    },
                ]
            }).then(async quiz => {
                console.log(JSON.stringify(quiz, null, 2))
                var studentIds = [];
                quiz.McqAnswers.forEach(x => {
                    studentIds.push(x.studentId)
                });
                quiz.textAnswers.forEach(x => {
                    studentIds.push(x.studentId)
                });
                const correctStudents = new Set(studentIds).size;
                console.log(studentIds)
                console.log("Number of students who got the correct answer: " + correctStudents)
                const docmentAsBytes = await fs.promises.readFile(content.filePath);
                const pdfDoc = await PDFDocument.load(docmentAsBytes);
                const numberOfPages = pdfDoc.getPages().length;
                res.render("completequizreport", {totalStudents: content.cohort.students.length, participatingStudents: participatingStudents, correctStudents: correctStudents, task: content, numberOfPages: numberOfPages});
            })
        })
    })
})

app.post("/:contentId/:quizId/quizreportquery", function (req, res){
    res.redirect("/" + req.params.contentId + "/" + req.params.quizId + "/page/" + req.body.page + "/section/" + req.body.section + "/quizreport")
})

app.get("/:contentId/:quizId/page/:pageNum/section/:section/quizreport", function (req, res){
    Content.findByPk(req.params.contentId, {
        include : [
            {
                model: Cohort,
                include: [{
                    model: Student,
                }]
            }
        ]
    }).then(content => {
        console.log(JSON.stringify(content, null, 2));
        console.log("Total Students: " + content.cohort.students.length)
        Quiz.findByPk(req.params.quizId, {
            include : [
                {
                    model: McqAnswer,
                    include: [{
                        model: Mcq,
                        where: {
                            questionFromPage: "Page " + req.params.pageNum,
                            questionFromSection: req.params.section
                        },
                        required: true
                    }]
                },
                // {
                //     model: VoiceAnswer,
                //     include: [{
                //         model: Mcq,
                //         where: {
                //             questionFromPage: "Page " + req.params.pageNum,
                //             questionFromSection: req.params.section
                //         },
                //         required: true
                //     }]
                // },
                {
                    model: TextAnswer,
                    include: [{
                        model: Text,
                        where: {
                            questionFromPage: "Page " + req.params.pageNum,
                            questionFromSection: req.params.section
                        },
                        required: true
                    }]
                },
            ]
        }).then(quiz=>{
            console.log(JSON.stringify(quiz, null, 2))
            var studentIds = [];
            quiz.McqAnswers.forEach(x => {
                studentIds.push(x.studentId)
            });
            quiz.textAnswers.forEach(x => {
                studentIds.push(x.studentId)
            });
            const participatingStudents = new Set(studentIds).size;
            console.log(studentIds)
            console.log("Number of students participated in the Quiz: " + participatingStudents)
            Quiz.findByPk(req.params.quizId, {
                include : [
                    {
                        model: McqAnswer,
                        where: {
                            status: "Correct"
                        },
                        required: false,
                        include: [{
                            model: Mcq,
                            where: {
                                questionFromPage: "Page " + req.params.pageNum,
                                questionFromSection: req.params.section
                            },
                            required: true
                        }]
                    },
                    // {
                    //     model: VoiceAnswer,
                    //     where: {
                    //         status: "Correct"
                    //     },
                    //     required: true,
                    //     include: [{
                    //         model: Voice,
                    //         where: {
                    //             questionFromPage: "Page " + req.params.pageNum,
                    //             questionFromSection: req.params.section
                    //         },
                    //         required: true
                    //     }]
                    // },
                    {
                        model: TextAnswer,
                        where: {
                            status: "Correct"
                        },
                        required: false,
                        include: [{
                            model: Text,
                            where: {
                                questionFromPage: "Page " + req.params.pageNum,
                                questionFromSection: req.params.section
                            },
                            required: true
                        }]
                    },
                ]
            }).then(async quiz => {
                console.log(JSON.stringify(quiz, null, 2))
                var studentIds = [];
                quiz.McqAnswers.forEach(x => {
                    studentIds.push(x.studentId)
                });
                quiz.textAnswers.forEach(x => {
                    studentIds.push(x.studentId)
                });
                const correctStudents = new Set(studentIds).size;
                console.log(studentIds)
                console.log("Number of students who got the correct answer: " + correctStudents);
                const docmentAsBytes = await fs.promises.readFile(content.filePath);
                const pdfDoc = await PDFDocument.load(docmentAsBytes);
                const numberOfPages = pdfDoc.getPages().length;
                const folderName = content.fileName.replace(path.extname(content.fileName), "") + "-pageSection"
                const imgName = content.fileName.replace(path.extname(content.fileName), "") + "-page" + req.params.pageNum + "Section" + req.params.section + ".jpg"
                res.render("quizreport", {totalStudents: content.cohort.students.length, participatingStudents: participatingStudents, correctStudents: correctStudents, folderName: folderName, imgName: imgName, numberOfPages: numberOfPages, pageNum: req.params.pageNum, section: req.params.section, contentId: req.params.contentId, quizId: req.params.quizId});
            })
        })
    })
})

app.get("/:contentId/readingreport", function (req, res) {
    ReadingTime.findAll({
        where: {
            contentId: req.params.contentId,
            page: "1",
            section: "Top"
        }
    }).then(readingTime => {
        ReadingTime.max("time", {
            where: {
                contentId: req.params.contentId,
                page: "1",
                section: "Top"
            }
        }).then(time => {
            const maxTime = Math.ceil(time / 10) * 10
            var x_vals = [];
            var y_vals = [];
            var flag = 5;
            for (var i = 5; i <= maxTime + 5; i = i + 10) {
                x_vals.push(i);
                
                ReadingTime.count({
                    where: {
                        contentId: req.params.contentId,
                        page: "1",
                        section: "Top",
                        time: {
                            [Op.between]: [i-5, i+5],
                        }
                    }
                }).then(count => {
                    flag = flag + 10;
                    y_vals.push(parseInt(count));
                    if(flag === maxTime + 15){
                        return res.render("readingreport", { xValues: x_vals, yValues: y_vals })
                    }
                })
            }
        })
    })
})

app.get("/newface", function(req, res){
    res.render("faceupload");
})

app.post("/newface", function(req, res){
    captureShot(1, 1, req.user.name, req.user.id)
      .then(async (response) => { 
        // Whatever we resolve in captureShot, that's what response will contain
        console.log(response)
        const imgPath = response
        let result = await uploadLabeledImages(imgPath, req.user.name, req.user.id);
        if(result){
            res.json({message:"Face data stored successfully"})
        }else{
            res.json({message:"Something went wrong, please try again."})

        }
    })
})






async function uploadLabeledImages(imagePath, label , id) {
    try {
        const descriptions = [];
            const img = await canvas.loadImage(imagePath);
            // Read each face and save the face descriptions in the descriptions array
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(JSON.stringify(detections.descriptor));
            let df32 = new Float32Array(Object.values(JSON.parse(descriptions)))
            console.log(df32)
        
    
        // Create a new face document with the given label and save it in DB
        Face.create({
            label: label,
            descriptions: descriptions,
            userId: id
        },{
            include: [{
                association: Face.User
            }]
        }).then(()=>{
            return true;
        })
    } catch (error) {
        console.log(error);
        return (error);
    }
}


async function getDescriptorsFromDB(id, image) {
    // Get all the face data from mongodb and loop through each of them to read the data
    Face.findOne({
        where:{
            userId: id
        }
    }).then(async face => {
        console.log(face.label)
        console.log(face.descriptions)
        face.descriptions[0] = new Float32Array(Object.values(JSON.parse(face.descriptions[0])))
        console.log(face.descriptions[0])
        face = new faceapi.LabeledFaceDescriptors(face.label, face.descriptions);
        const faceMatcher = new faceapi.FaceMatcher(face, 0.6);
        // Read the image using canvas or other method
        const img = await canvas.loadImage(image);
        let temp = faceapi.createCanvasFromMedia(img);
        // Process the image for the model
        const displaySize = { width: img.width, height: img.height };
        faceapi.matchDimensions(temp, displaySize);
    
        // Find matching faces
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models/faceapi");
        const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
        console.log("bhai 8")
        console.log(results)
        return results;
            
        
        
    })
  }
  

async function detect(){
    const result = await getDescriptorsFromDB(1, "./public/userfaceid/nibir-ahmed-1671623095318-1.jpeg");
    console.log("bhai 9");
    console.log(result)
}

// detect();




app.get("/signout", function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

Teacher.User = Teacher.belongsTo(User, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Student.User = Student.belongsTo(User, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Cohort.Teacher = Cohort.belongsTo(Teacher, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Face.User = Face.belongsTo(User, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Teacher.hasMany(Cohort);
Student.belongsToMany(Cohort, { through: 'Cohort_Students' });
Cohort.belongsToMany(Student, { through: 'Cohort_Students' });
Cohort.belongsToMany(Cohort, { through: "Cohort_Subcohort", foreignKey: "parentCohortId", as: "subCohorts" });
Cohort.belongsToMany(Cohort, { through: "Cohort_Subcohort", foreignKey: "subCohortId", as: "parentCohorts" });
Content.Cohort = Content.belongsTo(Cohort, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Cohort.hasMany(Content);
Quiz.Content = Quiz.belongsTo(Content, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Content.hasMany(Quiz);
Mcq.Quiz = Mcq.belongsTo(Quiz, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Quiz.hasMany(Mcq);
McqAnswer.Quiz = McqAnswer.belongsTo(Quiz, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Quiz.hasMany(McqAnswer)
McqAnswer.Mcq = McqAnswer.belongsTo(Mcq, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
McqAnswer.Student = McqAnswer.belongsTo(Student, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Voice.Quiz = Voice.belongsTo(Quiz, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Quiz.hasMany(Voice);
Text.Quiz = Text.belongsTo(Quiz, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Quiz.hasMany(Text);
TextAnswer.Quiz = TextAnswer.belongsTo(Quiz, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Quiz.hasMany(TextAnswer)
TextAnswer.Text = TextAnswer.belongsTo(Text, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
TextAnswer.Student = TextAnswer.belongsTo(Student, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
ReadingTime.Student = ReadingTime.belongsTo(Student, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Student.hasMany(ReadingTime);
ReadingTime.Content = ReadingTime.belongsTo(Content, { constraints: true, onDelete: "CASCADE", foreignKey: { allowNull: false } });
Content.hasMany(ReadingTime);

sequelize
    .sync({
        //force: true
    })
    .then(result => {
        console.log(result);
        app.listen(3000, function () {
            console.log("Server Running");
        })
    })
    .catch(err => {
        console.log(err);
    })