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
        console.log('Heeeeeeuuuuuuuuu')
       profil.ModifyNickname(req, res)
    })
;

module.exports = router;