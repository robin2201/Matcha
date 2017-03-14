/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID

module.exports = {
    SearchByNickname: (req, res) => {
        let user = req.session.user
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            let UsersSearch = []
            //dbUser.find({}).each((err, result) => {
            //  if (result) {
            //    UsersSearch.push(result)
            // }
            //   console.log(UsersSearch)
            //  req.session.user = user
            //  res.render('gallery', {users: UsersSearch})
            // })
            dbUser.find({}, (err, data) => {
                data.forEach((resU) => {
                    UsersSearch.push(resU)
                    console.log(UsersSearch)
                })
                req.session.user = user
                res.render('gallery', {users: UsersSearch})
            })
            //req.session.user = user
            //res.render('gallery', {users: data})
        })
    },
    SearchByLocation: (req, res) => {

    },
    SearchBySexe: (req, res) => {

    },
    SearchByAge: (req, res) => {

    },
    RenderProfilUsers: (req, res) => {

    }
}

