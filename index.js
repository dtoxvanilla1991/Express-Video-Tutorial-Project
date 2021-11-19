const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const User = require('./models/users');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser'); //TOTALLY CONDITIONAL so i will try not to use it
const videoRoutes = require('./routes/landingRoutes');
const authRoutes = require('./routes/auth');
const Handlebars = require('handlebars');

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const app = express();

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

const dbUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.qw3d0.mongodb.net/${process.env.MONGO_DATABASE}`;
//set up engines:

app.engine('hbs', handlebars({
    extname:'.hbs',
    partialsDir: __dirname + '/looks/partials',
        /*i know it is not necessary but i want to practice: changing from layouts.hbs to main.hbs */
    defaultLayout: ('./main'),
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

 /*i know it is not necessary but i want to practice: changing the views folders from views to LOOKS */
 app.set('views', __dirname + '/looks');

app.set('view engine', 'hbs');

//setting up session middleware(extra stuff):
const store = new MongoDBStore({
    uri: dbUrl,
    collection: 'sessions'
  });

  app.use(session({
      secret: 'my secret',
      resave:false,
      saveUninitialized: false,
      store: store
  }));
  //connect-flash:
  app.use(flash());



//session strategy:
  //if not user: go next;
  app.use((req, res, next) => {
      if(!req.session.user) {
          return next();
      }
      User.findById(req.session.user._id).then(user => {
          req.user = user;
          next();
      });
  });
  //if user is there, attach to req all reqs that come to the server.


  //using local variables:
  app.use((req, res, next)=> {
    res.locals.isAuth = req.session.pass;
  //  res.locals.notEnrolled = req.session.notEnrolled; 
    res.locals.errorMessage = req.flash('error');
    res.locals.successMessage = req.flash('success');
    next();
  });

// general middlewears:
app.use(express.static('static'));
app.use(express.urlencoded({extended:false})); // could use body-Parser here
app.use(videoRoutes);
app.use(authRoutes);
app.use((req, res) => {
 res.render('../looks/404.hbs');
});
// connecting to db and running server:
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then(()=> {
    console.log('Connected to DB');
    app.listen(port, console.log(`Listening on port ${port}! Now its up to you...`));
}).catch((err)=> {
    console.log(err);
});
