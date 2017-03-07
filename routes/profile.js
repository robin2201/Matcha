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
       profil.ModifyNickname(req, res)
    })

    .post('/Addtags', (req, res) => {

    })
;

module.exports = router;