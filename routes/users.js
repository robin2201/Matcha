const express = require('express');
const router = express.Router();
const home = require('../controllers/UserController')
const Upload = require('../config/MulterUpload')
const userToShow = require('../controllers/SearchController').showOneUser


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

    .get('/activation/:id/:token', (req, res) => {
        home.valideToken(req, res)
    })

    .post('/upload', (req, res) => {
        Upload(req, res, (err) => {
            if (err) return res.end("Error uploading file. " + err)
            else {
                home.AddPicToDb(req, res)
            }
        })
    })

    .get('/view/:id', (req, res) => {
        userToShow(req, res)
    })

    .get('*', (req, res) => {
        res.render('index')
    });

module.exports = router;
