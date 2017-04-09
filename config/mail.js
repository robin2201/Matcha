/**
 * Created by robin on 2/21/17.
 */
const nodeMailer = require('nodemailer')

const transporter = nodeMailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '',
        pass: ''
    }
})

module.exports = transporter