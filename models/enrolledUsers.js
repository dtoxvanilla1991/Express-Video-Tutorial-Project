const mongoose =  require('mongoose');
const schema = mongoose.Schema;
const videoCourse = require('./videoCourse');

const usersEnrolledSchema = schema({
    name: {
        type: String,
        required: true,
    },
    videoCourses: [{
        type: schema.Types.ObjectId,
        ref: 'videoCourse',
    }]
});

module.exports = mongoose.model('users', usersEnrolledSchema);