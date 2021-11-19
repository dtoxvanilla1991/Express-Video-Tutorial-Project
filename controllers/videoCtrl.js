const fs = require('fs');
const videoCourse = require('../models/videoCourse');

/* I'll need to create const publicViewOption = [{selected: }] here i think to make courses Public or Private */
// const publicViewOption = [{Public: yes, selected: false}, {Public: no, selected: false}];

exports.guestHome = (req, res) => {
    //access database

    videoCourse.find({}).then((courses) => {

        //copy:
        const courseCopy = [...courses];

        if (req.query.search) {
            courses = courses.filter(course => course.name.toLowerCase().includes(req.query.search.toLowerCase()));

            if (courses.length == 0) {
                courses = courseCopy;
            }
        }
        //render it
        res.render('../looks/layouts/home pages/guest-home.hbs', {
            docTitle: 'Guest Page',
            courses
        });
    });

};

exports.userProfile = (req, res) => {
    //access database

    videoCourse.find({}).then((courses) => {

        //copy:
        const courseCopy = [...courses];

        if (req.query.search) {
            courses = courses.filter(course => course.name.toLowerCase().includes(req.query.search.toLowerCase()));

            if (courses.length == 0) {
                courses = courseCopy;
            }
        }

        let enrolled = false;

        courses.forEach(course => {
            if (course.enrolledUsers.includes(req.user._id.toString())) {
                enrolled = true;
            }
        });
        //render it
        res.render('../looks/layouts/home pages/user-home.hbs', {
            docTitle: 'User Home Page',
            courses,
            enrolled
        });
    });

};

exports.aboutUs = (req, res) => {
    res.render('about.hbs', {
        docTitle: 'About us'
    });
};

exports.createCourse = (req, res) => {
    res.render('create.hbs', {
        docTitle: 'Create Course'
    });
};

exports.postCourse = (req, res) => {

    const formData = req.body;
    if (formData.public) {
        formData.public = true;
    } else {
        formData.public = false;
    }

    const imagePattern = /^https?:\/\/.*\/.*\.(png|gif|jpg|jpeg)\??.*$/gmi;
    //validation
    if (!formData.name)
        return console.log('No name');
    else if (!formData.description || formData.description.length >= 200)
        return console.log('No desc / desc too long');
    else if (!formData.image || !imagePattern.test(formData.image))
        return console.log(' no image / Invalid image');

    formData.creatorId = req.user._id.toString();

    const newVideoCourse = new videoCourse(formData);

    newVideoCourse.save().then(() => {
        console.log('Video Course stored in DB');
        res.redirect('/');
    }).catch((err) => {
        console.log(err);
    });

};

exports.courseDetails = (req, res) => {
    const id = req.params.courseId;
    console.log(id);
    videoCourse.findById(id).then(course => {
        console.log(course);
        //checking for the owner of the course:
        let owner = false;
        //seeing if logged in:
        if (req.user) {
            owner = req.user._id.toString() === course.creatorId;
        }

        res.render('details.hbs', {
            docTitle: `Details | ${id}`,
            name: course.name,
            description: course.description,
            id: course._id,
            image: course.image,
            owner
        });
    });
};

exports.editDetails = (req, res) => {
    const id = req.params.courseId;
    console.log(id);
    videoCourse.findById(id).then(course => {
        console.log(course);
        res.render('edit.hbs', {
            docTitle: `Edit | ${id}`,
            name: course.name,
            description: course.description,
            id: course._id,
            image: course.image,
        });
    });
};

exports.postEditDetails = async (req, res) => {

    //getting ID from params
    const courseId = req.params.courseId;
    //search in db forthe course
    const course = await videoCourse.findById(courseId);
    //update it here
    course.name = req.body.name;
    course.description = req.body.description;
    course.image = req.body.image;
    // save
    await course.save();
    //redirect to profile
    res.redirect('/profile');

};

exports.postDeleteCourse = async (req, res) => {

    const id = req.params.courseId;

    await videoCourse.findByIdAndDelete(id);
    req.flash('success', 'Course deleted successfully!');
    res.redirect('/profile');

};

exports.postEnrolledUser = async (req, res) => {
    //getting course ID
    const id = req.params.courseId;
    //getting course in DB
    const course = await videoCourse.findById(id);
    //getting user
    const creatorId = req.user._id.toString();
    //enrolling user
    course.enrolledUsers = [...course.enrolledUsers, creatorId];
    //checking if user got added:
    console.log(course);
    req.flash('success', 'Enrolled successfully!');
    res.redirect('/profile');

};