/**
 * Created by robin on 2/20/17.
 */
const crypto = require('crypto');
const base64url = require('base64url');
const transporter = require('../config/mail')

class User {


    constructor(data) {
        this.data = data;
    }

    GetFirstname() {
        return this.data.firstname
    }

    SetFirstname(firstname) {
        this.data.firstname = firstname
    }

    Getlastname() {
        return this.data.lastname
    }

    Setlastname(lastname) {
        this.data.lastname = lastname
    }

    SetRandomToken(int) {
        this.data.token = base64url(crypto.randomBytes(int))
    }

    GetRandomToken() {
        return this.data.token
    }

    static GetPassword() {
        return this.data.hash
    }

    SetPasword(password) {
        this.data.pasword = hash
    }

    GetEmail() {
        return this.data.email
    }

    SetEmail(email) {
        this.data.email = email
    }

    GetGender() {
        return this.data.gender
    }

    SetGender() {
        this.data.gender = gender
    }

    SetBirthday(){
        this.data.birthdate = birthday
    }
    static create({firstname, lastname, hash, email, gender, birthday}, callback) {
        let token = base64url(crypto.randomBytes(42))
        let UserToConstruct = {
            firstname,
            lastname,
            hash,
            email,
            token,
            gender,
            birthday
        }
        callback(new User(UserToConstruct))
    }

    SendActivationMail(req, res) {

        let EmailContent = 'http://localhost:3000/users/activation/:' + req.session.userId + '/:' + this.GetRandomToken()
        let message = {
            from: 'MatchaHelper@love.com',
            to: this.GetEmail(),
            subject: 'Valide Your Matcha Account! ',
            text: 'Hello You',
            html: '<b>Hello Ready to find Love</b>' +
            '<p>Cliquer sur le lien suivant : </p>' +
            '<a href="' + EmailContent + '">Find Love</a> ',
        }
        transporter.verify((error, success) => {
            if (error) return console.log(error)
            else {
                console.log('Server is ready to take our messages')
                transporter.sendMail(message,
                    (error, info) => {
                        if (error) return console.log(error)
                        console.log('Message %s sent: %s', info.messageId, info.response)
                        transporter.close()
                    });
            }
        });

    }
}

module.exports = User;

