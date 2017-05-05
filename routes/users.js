const express = require('express');
const router = express.Router();
const home = require('../controllers/UserController')
const Upload = require('../config/MulterUpload')
const userToShow = require('../controllers/SearchController').showOneUser


router.get('/', (req, res) => {
    let user = req.session.user
    if (user) {
        home.updateMySession(req, res)
        res.render('home', {user:req.session.user})
    }
    res.redirect('/')
})

    .post('/login', (req, res) => {
        home.signinUser(req, res)
    })

    .post('/register', (req, res) => {
        home.registerUser(req, res)
    })

    .get('/activation/:id/:token', (req, res) => {
        home.valideToken(req, res)
    })

    .post('/upload', (req, res) => {
        Upload(req, res, err => {
            let user = req.session.user
            if (err) {
                req.session.user = user
                return res.redirect('/profile')
            }
            else home.AddPicToDb(req, res)
        })
    })

    .get('/view/:id', (req, res) => {
        userToShow(req, res)
    })

    .get('*', (req, res) => {
        res.render('index')
    })
    .get('/home', (req, res) => {
        if(req.session.user !== undefined){
            home.updateMySession(req,res)
            res.render('home', {user:req.session.user})
        }else res.redirect('index')
    })

module.exports = router
