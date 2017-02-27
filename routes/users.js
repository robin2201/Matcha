const express = require('express');
const router = express.Router();
const mongoUtil = require('../config/db');
const home = require('../controllers/UserController')
const multer = require('multer')
const Upload = require('../config/MulterUpload')

let storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now());
    }
});

let upload = multer({storage: storage}).single('image');


let isAuthenticated = (req, res, next) => {
    console.log(req)
    if (req.session.user) {
        next()
    } else {
        let err = new Error('Please logIn before')
        next(err)
    }
}

/* GET users listing. */
router.get('/', (req, res, next) => {
    let user = req.session.user
    if (user) {
        res.render('home', user)
    }
    res.redirect('/')
})

    .post('/login', (req, res) => {
        home.signinUser(req, res)
    })

    .post('/register', (req, res, next) => {
        home.registerUser(req, res)
    })

    .get('/logout', (req, res) => {
        home.logout(req, res)
    })

    .get('/activation/:id/:token', (req, res) => {
        home.valideToken(req, res)
    })

    .get('/profile', (req, res) => {
        let user = req.session.user
        if (user) {
            res.render('profile', user)
        }
    })

    .post('/add', (req, res) => {
        home.AddDataToUser(req, res)
    })

    .post('/upload', (req, res) => {
        Upload(req, res, (err) => {
            if (err) {
                return res.end("Error uploading file. " + err);
            }
            console.log(req.file)
            res.end("File is uploaded");
        })
    })

    .get('/:userId', (req, res, next) => {

    })


    .get('*', (req, res) => {
        res.render('index')
    });

module.exports = router;
