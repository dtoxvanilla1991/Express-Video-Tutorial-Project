const mongoose =  require('mongoose');
const schema = mongoose.Schema;
const users = require('./enrolledUsers');

const videoCourseSchema = schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 500,
    },
    image: {
        type: String,
        required: true,
    },
    creatorId: {
        type: String,
        // required: true
    },
    public: {
        type: Boolean,
        required: true,
    },
    enrolledUsers: [{
        type: schema.Types.ObjectId,
        ref: 'UsersEnrolled',
        }]
});

module.exports = mongoose.model('videoCourse', videoCourseSchema);