const express = require('express');
const router = express.Router();
const home = require('../controllers/UserController')
const Upload = require('../config/MulterUpload')

/*
 let isAuthenticated = (req, res, next) => {
 console.log(req)
 if (req.session.user) {
 next()
 } else {
 let err = new Error('Please logIn before')
 next(err)
 }
 }
 */
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

    .post('/add', (req, res) => {
        home.AddDataToUser(req, res)
    })

    .post('/upload', (req, res) => {
        Upload(req, res, (err) => {
            if (err) return res.end("Error uploading file. " + err);
            else {
                home.AddPicToDb(req, res)
            }
        })
    })

    .get('/:userId', (req, res, next) => {

    })

    .get('*', (req, res) => {
        res.render('index')
    });

module.exports = router;
