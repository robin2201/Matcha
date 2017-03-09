/**
 * Created by robin on 3/1/17.
 */
const express = require('express')
const router = express.Router()
const profil = require('../controllers/UserProfile')

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
;

module.exports = router;