/**
 * Created by robin on 3/1/17.
 */
const express = require('express')
const router = express.Router()
const profil = require('../controllers/UserProfile')
const search = require('../controllers/SearchController')
const modifyPassword = require('../controllers/UserController').modifyPassword

router.get('/', (req, res) => {
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
    .post('/blockOther', (req, res) => {
        search.blockOther(req, res)
    })
    .post('/clearNotif', (req, res) => {
        profil.clearAllMyNotifications(req, res)
    })

    .post('/forgotPassword', (req, res) => {
        profil.sendEmailInstructionForNewPassword(req, res)
    })

    .post('/modifPass', (req, res) => {
        modifyPassword(req, res)
    })

    .post('/DellPics', (req, res) => {
        profil.DellPics(req, res)
    })

    .post('/GuestPic', (req, res) => {
        profil.GuestPic(req, res)
    })

    .post('/sortPopularity', (req, res) => {
        search.searchAndSortByPopularity(req, res)
    })


module.exports = router

//TODO => Need to create function changeMyPassword(req, res) in userController
//TODO => Maybe create a module who can check pass with bcrypt
//TODO => Now is a redurection but modifPass but in future in a email