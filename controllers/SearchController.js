/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID


module.exports = {

    SearchByNickname: (req, res) => {
        console.log(req.body)
        let gender = req.body.gender
        let search = req.body.search
        let dbkey = {}
        if (gender !== undefined || gender !== '') {
            if (gender === '1') {
                dbkey.gender = '1'
            } else if (gender === '0') {
                dbkey.gender = '0'
            }
        }
        if (search !== undefined) {
            dbkey.tags = search
        }
        let test = {"gender": "1"}
        let user = req.session.user
        console.log("test")
        console.log(test)
        let UsersSearch = []
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            if (dbkey.gender === undefined && dbkey.tags === undefined) {
                dbUser.find({}).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            } else {
                dbUser.find(dbkey).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            }

            /*let geonear = dbUser.runCommand({
             geoNear: "Users",
             near: {
             type: "Point",
             coordinates: [ "location.long", "location.lat" ]
             },
             spherical: true,
             })
             console.log(geonear)*/

            console.log('re1')
        })
    }
}

