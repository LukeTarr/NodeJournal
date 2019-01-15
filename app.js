const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const passport = require('passport');

const app = express();

//Load Routes
const notes = require('./routes/notes');
const users = require('./routes/users');

//Passport middleware
require('./config/passport')(passport);

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose
mongoose.connect('mongodb://localhost/nodejournal-dev', {
    useNewUrlParser: true
  })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// Load Note Model
require('./models/Note');
const Note = mongoose.model('notes');

// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

//Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//methodOverride middleware
app.use(methodOverride('_method'));

//express-session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//connect-flash middleware
app.use(flash());

//Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Index Route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

//use Routes
app.use('/notes', notes);
app.use('/users', users);

const port = 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});