/**
 * Created by robin on 2/21/17.
 */
const nodeMailer = require('nodemailer')

const transporter = nodeMailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '33c9502726c803',
        pass: '3261b4bf3cd7a2'
    }
})

module.exports = transporter