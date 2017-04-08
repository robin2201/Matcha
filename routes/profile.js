/**
 * Created by robin on 3/1/17.
 */
const express = require('express')
const router = express.Router()
const profil = require('../controllers/UserProfile')
const search = require('../controllers/SearchController')

router.get('profile', (req, res) => {
     //profil.loadMyProfilWithMyNotifications(req, res)
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
    .post('/clearNotif', (req, res) => {
        profil.clearAllMyNotifications(req, res)
    })
    .get('/forgotPassword', (req, res) => {
        return res.render('forgot')
    })
    .post('/forgotPassword', (req, res) => {
        profil.sendEmailInstructionForNewPassword(req, res)
    })
    .get('/modifPass/:id', (req, res) => {
        console.log(req.params)
        res.render('index', {
            message:"Your pass is correctly changed! 🔑"
        })
    })


module.exports = router

//TODO => Need to create function changeMyPassword(req, res) in userController
//TODO => Maybe create a module who can check pass with bcrypt
//TODO => Now is a redurection but modifPass but in future in a email