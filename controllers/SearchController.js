/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID
module.exports = {
    SearchByNickname: (req, res) => {
        console.log(req.body)
        let user = req.session.user
        let UsersSearch = {}
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            dbUser.find({ }).toArray((err, dataUsers) => {
                UsersSearch = dataUsers
                req.session.user = user
                res.render('home', {users: UsersSearch})
            })
            /*let geonear = dbUser.runCommand({
                geoNear: "Users",
                near: {
                    type: "Point",
                    coordinates: [ "location.long", "location.lat" ]
                },
                spherical: true,
            })
            console.log(geonear)*/
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

