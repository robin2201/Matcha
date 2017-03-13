/**
 * Created by robin on 3/10/17.
 */

const mongoUtil = require('../config/db')
const objectId = require('mongodb').ObjectID

module.exports = {
    SearchByNickname: (req, res) => {
        let user = req.session.user
        console.log(req.body)
        let searchU = req.body.search
        console.log(searchU)
        mongoUtil.connectToServer((err) => {
            if (err) return res.sendStatus(500)
            let dbUser = mongoUtil.getDb().collection('Users')
            let db = mongoUtil.getDb()
            let findUser = {"location.region":"Île-de-France"}
            let dbTest = db.collection('Users').find(findUser,
                (err, result, cursor) => {
                console.log(result)
                    console.log(cursor)
                })
            console.log(dbTest)
            //let mydc = dbTest.hasNext() ? dbTest.next() : null
            //if(mydc){
             //   console.log(mydc)
            //}
            req.session.user = user
        })

        res.render('home')
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

