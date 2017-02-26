const express = require('express');
const router = express.Router();
const mongoUtil = require('../config/db');
const home = require('../controllers/UserController')
const upload = multer({dest: '/uplaods'})

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

        console.log(req.body)
        console.log(req.file)
        //split the url into an array and then get the last chunk and render it out in the send req.
        /*
        res.send(util.format(' Task Complete \n uploaded %s (%d Kb) to %s as %s'
            , req.files.image.name
            , req.files.image.size / 1024 | 0
            , req.files.image.path
            , req.body.title
            , req.files.image
            , '<img src="uploads/' + pathArray[(pathArray.length - 1)] + '">'
        ));*/
    })

    .get('/:userId', (req, res, next) => {

    })


    .get('*', (req, res) => {
        res.render('index')
    });

module.exports = router;
