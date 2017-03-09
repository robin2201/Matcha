/**
 * Created by robin on 2/21/17.
 */
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {

    }
});

module.exports = transporter;