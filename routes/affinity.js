/**
 * Created by robin on 4/2/17.
 */

const express = require('express')
const router = express.Router()
const socketUtils = require('../controllers/SocketsController')

 router.get('/', (req, res) => {
     socketUtils.loadAllMyChat(req, res)
})

module.exports = router