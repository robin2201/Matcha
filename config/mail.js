/**
 * Created by robin on 2/21/17.
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: '33c9502726c803',
        pass: '3261b4bf3cd7a2'
    }
});

module.exports = transporter;