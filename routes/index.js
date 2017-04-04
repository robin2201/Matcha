const express = require('express');
const router = express.Router();
//const db = require('../config/db');
//const session = require('express-session');
const home = require('../controllers/UserController');


router.get('/', (req, res) => {
    res.render('index')
})
    .get('/register', (req, res) => {
        res.render('partials/register')
    })
    .get('/login', (req, res) => {
        res.render('partials/login')
    })
    .get('/home', (req, res, next) => {
        let user = req.session.user
        res.render('home', {user: user})
    })
    .get('/profile', (req, res) => {
        let user = req.session.user
        res.render('profile', {user:user})
    })
    .get('/logout', (req, res) => {
        home.logout(req, res)
    })

module.exports = router
