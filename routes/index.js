const express = require('express');
const router = express.Router();
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
        if(req.session.user !== undefined){
            let user = req.session.user
            res.render('home', {user: user})
        } else res.render('index', {message: "You need to log befores"})
    })
    .get('/profile', (req, res, next) => {
        if(req.session.user !== undefined) {
            let user = req.session.user
            res.render('profile', {user: user})
        }else res.render('index', {message: "You need to log befores"})
    })
    .get('/logout', (req, res) => {
        home.logout(req, res)
    })
    .get('/modifPass/:id', (req, res) => {
        res.render('forgot', {
            info:"password",
            id:req.params.id.substr(1)
        })
    })
    .get('/forgotPassword', (req, res) => {
        return res.render('forgot', {info:'email'})
    })
    // .get('*', (req, res, next) => {
    //     let message = "Sorry this page doesn't exist"
    //     if(next) message = "To acces this pages you need to log in before"
    //     res.render('index', {
    //         user:(req.session.user ? req.session.user : ''),
    //         message: message
    //     })
    // })

module.exports = router
