/**
 * Created by robin on 3/1/17.
 */
const express = require('express')
const router = express.Router()
const profil = require('../controllers/UserProfile')
const search = require('../controllers/SearchController')

router.get('/', (req, res) => {
        res.render('profile')
})
    .post('/me', (req, res) => {
       profil.ModifyInfoUser(req, res)
    })
    .post('/email', (req, res) => {
        profil.ModifyEmail(req, res)
    })
    .post('/addTags', (req, res) => {
        profil.AddTags(req, res)
    })
    .post('/location', (req, res) => {
        profil.AddLocation(req, res)
    })
    .post('/findMe', (req, res) => {
        profil.FindAdressWithIP(req, res)
    })
    .post('/search', (req, res) => {
      //  let user = req.session.user
        search.SearchByNickname(req, res)
        //let search = req.body
       // console.log(req.body)
        //console.log(req.session.user)
       // req.session.user = user
       // res.render('home', {user: user})
    })
;

module.exports = router;