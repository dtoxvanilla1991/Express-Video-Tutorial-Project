const User = require('../models/users');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const {
    validationResult
} = require('express-validator');

exports.getLogin = (req, res) => {
    res.render('../looks/layouts/user pages/login.hbs', {
        docTitle: 'Login'
    });
};

exports.getSignup = (req, res) => {
    res.render('../looks/layouts/user pages/register.hbs', {
        docTitle: 'Register',
        errorMessage: req.flash('error'),
        successMessage: req.flash('success')
    });
};

exports.postSignup = (req, res) => {

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    //making sure username is not taken next => to registration
    User.find({
        username: username
    }).then(userData => {
        if (userData.length > 0) {
            req.flash('error', 'Username is taken, try another one');
            return res.redirect('/register');
        }
    });


    //making sure email is also not taken yet too next (otherwise you already have an account) => to login
    User.find({
            email: email
        })
        .then(userData => {
            if (userData.length > 0) {
                req.flash('error', 'Email account already exists, just log in.');
                return res.redirect('/login');
            }

            //hashing password and store user in db. => to home

            return bcrypt.hash(password, 12).then(hash => {
                //create user obj with encrypted password:
                const user = new User({
                    password: hash,
                    email,
                    username
                });
                return user.save();
            });
        }).then(result => {
            res.redirect('/login');
        }).catch(err => {
            console.log(err);
        });

};

exports.postLogin = (req, res) => {

    //get variables:

    const password = req.body.password;
    const username = req.body.username;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('../looks/layouts/user pages/login.hbs', {
            docTitle: 'Login',
            errorMessage: errors.array()[0].msg
        });

    }
    //checking existence of user:

    User.findOne({
        username: username
    }).then(user => {
        //if no user:
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }
        //check if password in db and input is correct:
        bcrypt.compare(password, user.password).then(result => {
            if (result) {
                //user passed:
                req.session.pass = true;
                req.session.user = user;
                //storing in db:
                return req.session.save((err) => {
                    console.log(err);
                    req.flash('success', 'Logged in successfully');
                    res.redirect('/profile');
                });

            }
            //if password is wrong:
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');

        });
    }).catch(err => {
        console.log(err);
        res.redirect('/login');
    });

};

exports.getLogout = (req, res) => {
    req.flash('success', 'You are now logged out!');
    //term the session
    req.session.destroy(err => {
        console.log(err);
        //redirect
        res.redirect('/');
    });
};

exports.getReset = (req, res) => {
    res.render('../looks/layouts/user pages/reset.hbs', {
        docTitle: 'Reset'
    });
};

exports.postReset = (req, res) => {

    const email = req.body.email;
    //creating token:
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect('/');
        }
        const token = buffer.toString('hex'); //gen token
    });
    //finding user who wants to reset his/her pass
    User.findOne({
        email: email
    }).then(user => {
        if (!user) {
            res.flash('error', "No account with this email");
        }
        //updating the user by adding the token and the expiration to his document in db
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
    }).then(res => {
        req.flash('success', 'Check your email');
        res.redirect('/');
        return transporter.sendMail({
            to: email,
            from: 'fakeemail@gmail.com',
            subject: 'Password Rerset',
            html: `
            <p> You required a password reset.</p>
            <p> Click on the link below to reset it</p>
            <a href="http://localhost:4500/reset/${token}"> Reset here</a>
            ` //this email is intentionally incorrect, Alfred. I didnt want to create email just for this.
        }).then(info => {
            console.log(info);
        }).catch(err => {
            console.log(err);
        });
    });

    //sending email with http://localhost:4500/reset/${token}



};

exports.getNewPassword = (req, res) => {
    const token = req.params.token;


    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        }
    }).then(user => {
        if (!user) {
            return res.redirect('/login');
        }
        res.render('../looks/layouts/user pages/newpassword.hbs', {
            token,
            docTitle: 'New Password reset',
            userId: user._id
        });
    }).catch(err => {
        console.log(err);
    });
};

exports.postNewPassword = (req, res) => {

    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.token;
    let resetUser;

    //find a user token, expiration date and his ID
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        },
        _id: userId

    }).then(user => {
        if (user) {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        }
    }).then(hash => {
        resetUser.password = hash;
        resetUser.resetToken = null;
        resetUser.resetTokenExpiration = undefined;

        return resetUser.save();
    }).then(res => {
        req.flash('success', 'Password is reset!');
        res.redirect('/login');
    });
};