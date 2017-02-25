/**
 * Created by robin on 2/18/17.
 */

let schema = {
    'email':{
        notEmpty: true,
        optional: {
            options: { checkFalsy: true }
        },
        isEmail: {
            errorMessage: 'Invalid Email'
        }
    },
    'firstname':{
        notEmpty: true,
        optional: true,
        isLength: {
            options: [{ min: 3, max: 10 }],
            errorMessage: 'Must be between 2 and 10 chars long'
        },
        errorMessage: 'Invalid First Name'
    },
    'lastname': {
        notEmpty: true,
        optional: true,
        isLength: {
            options: [{ min: 3, max: 10 }],
            errorMessage: 'Must be between 2 and 10 chars long'
        },
        errorMessage: 'Invalid Last Name'
    },
    'password': {
        notEmpty: true,
        optional: true,
        /* matches: {
         options: [(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,22}$/, "i")],
         errorsMessage: 'Not a valid password'
         },
         equals: {
         options: [('cPassword')],
         errorMessage: "Password differences"
         }
         },*/
        isAlphanumeric: {
            errorMessage: 'Sorry enter only Alphanumericals values'
        },
        isLength: {
            options: [{ min: 8, max: 22 }],
            errorMessage: 'Must be between 2 and 8 chars long'
        },
        // equals: (req.body.cPassword, 'not same value')
    }
}


module.exports = schema;