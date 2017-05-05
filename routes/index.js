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
    .get('/home', (req, res) => {
        if (req.session.user !== undefined) {
            home.updateMySession(req, res)
            let user = req.session.user
            res.render('home', {user: user})
        } else res.redirect('/')
    })
    .get('/profile', (req, res) => {
        console.log('Yes')
        if (req.session.user !== undefined) {
            home.updateMySession(req, res)
            res.render('profile', {user: req.session.user})
        } else res.redirect('/')

    })
    .get('/logout', (req, res) => {
        home.logout(req, res)
    })
    .get('/modifPass/:id', (req, res) => {
        res.render('forgot', {
            info: "password",
            id: req.params.id.substr(1)
        })
    })
    .get('/forgotPassword', (req, res) => {
        return res.render('forgot', {info: 'email'})
    })
// .get('*', (req, res, next) => {
//     if(req.session.user === undefined){
//        let message = "To acces this pages you need to log in before"
//         res.render('index', {
//             message: message
//         })
//     }
// })

module.exports = router
