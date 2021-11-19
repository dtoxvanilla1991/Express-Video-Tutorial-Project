const express = require("express");
const router = express.Router();
const videoCtrl = require('../controllers/videoCtrl');

//MVC(model-view-controller) design pattern:

router.get('/', videoCtrl.guestHome);

router.get('/about', videoCtrl.aboutUs);

router.get('/create', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/login');
    }
}, videoCtrl.createCourse);

router.post('/create', videoCtrl.postCourse);

router.get('/details/:courseId', videoCtrl.courseDetails);

router.get('/profile', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/login');
    }
}, videoCtrl.userProfile);

router.get('/edit/:courseId', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/login');
    }
}, videoCtrl.editDetails);

router.post('/edit/:courseId', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/profile');
    }
}, videoCtrl.postEditDetails);

router.post('/delete/:courseId', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/profile');
    }
}, videoCtrl.postDeleteCourse);

router.post('/enroll/:courseId', (req, res, next) => {
    if(req.session.pass) {
        next();
    } else {
        res.redirect('/profile');
    }
}, videoCtrl.postEnrolledUser);

module.exports =  router;