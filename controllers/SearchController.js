/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')

module.exports = {

    SearchByNickname: (req, res) => {
        let {gender, search, ageMin, ageMax} = req.body
        let dbkey = {}
        if (gender !== undefined || gender !== '') {
            if (gender === '1') {
                dbkey.gender = '1'
            } else if (gender === '0') {
                dbkey.gender = '0'
            }
        }
        if (search !== undefined && search !== '') {
            dbkey.tags = search
        }
        console.log(gender)
        console.log(search)
        console.log(ageMin)
        console.log(ageMax)
        if (ageMin || ageMax) {
            let ageIntervalle = {
                $gt: (ageMin ? ageMin : 18),
                $lt: (ageMax ? ageMax : 100)
            }
            dbkey.age = ageIntervalle
        }
        let user = req.session.user
        let UsersSearch = []
        let out = {
            hash: 0,
            email: 0,
            token: 0,
            lastname: 0,
            birthday: 0
        }
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            console.log(dbkey)
            if (dbkey.gender !== undefined || dbkey.tags !== undefined || dbkey.age !== undefined) {
                dbUser.find(dbkey, out).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            } else {
                dbUser.find({}, out).toArray((err, dataUsers) => {
                    UsersSearch = dataUsers
                    req.session.user = user
                    res.render('home', {users: UsersSearch})
                })
            }
            console.log('re1')
        })
    }
}

