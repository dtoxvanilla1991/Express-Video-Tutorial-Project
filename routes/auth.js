const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authCtrl');
const {
    body
} = require('express-validator');
//login
router.get('/login', authCtrl.getLogin);
router.post('/login', [
    body('username')
    .isAlphanumeric()
    .withMessage('Username should have only numbers and letters')
    .isLength({
        min: 5,
        max: 20
    }),
    body('password', 'Check your password')
    .isAlphanumeric()
    .isLength({
        min: 5,
        max: 20
    })
], authCtrl.postLogin);
//logout
router.get('/logout', authCtrl.getLogout);
//register
router.get('/register', authCtrl.getSignup);
router.post('/register', authCtrl.postSignup);
//reset Pass
router.get('/reset', authCtrl.getReset);
router.post('/reset', authCtrl.postReset);
router.get('/reset/:token', authCtrl.getNewPassword);
router.post('/new-password', authCtrl.postNewPassword);


module.exports = router;