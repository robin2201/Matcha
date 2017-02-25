const express = require('express');
const router = express.Router();
const mongoUtil = require('../config/db');

const home = require('../controllers/UserController')
/*
 let isAuthenticated = (req, res, next) => {
 console.log('herrre')
 console.log(req)
 if (req.session.user_id){
 // res.render('home', {user: req.session.user_id})
 return next()
 }
 res.redirect('/users/register')
 };
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

    .get('/profile', (req, res) => {
        let user = req.session.user
        if (user) {
            res.render('profile', user)
        }
    })

    .post('/add', (req, res) => {
        if (req.body) {
            home.AddDataToUser(req, res)
        }
        res.redirect('/')
    })

    .get('/users/:userId', (req, res, next) => {

    })

    .get('*', (req, res) => {
        res.render('index');
    });

module.exports = router;
