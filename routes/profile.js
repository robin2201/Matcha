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
    .post('/addAge', (req, res) => {
        profil.verifyAndSetAge(req, res)
    })
    .post('/findMe', (req, res) => {
        profil.FindAdressWithIP(req, res)
    })
    .post('/search', (req, res) => {
        search.SearchByNickname(req, res)
    })
    .post('/dellTags', (req, res) => {
        profil.DellTags(req, res)
    })
    .post('/likeOther', (req, res) => {
        search.likeAndVerifyOtherProfile(req, res)
    })
;

module.exports = router;