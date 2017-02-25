const express = require('express');
const router = express.Router();
//const db = require('../config/db');
const session = require('express-session');
const home = require('../controllers/UserController');

let isAuthenticated = (req, res, next) => {
    console.log('HHHHHehhhhhhhhhhheree')
    console.log(req.session)
    if (req.session.user_id) {
        console.log(req.session)
        //res.render('home', { user: req.session.user_id })
        return next();
    }
    res.redirect('/register');
};

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
        let {user} = req.session.user
        res.render('home', {user: user})
    })

;

module.exports = router;
