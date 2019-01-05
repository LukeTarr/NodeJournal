const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

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

//methodOverride middleware
app.use(methodOverride('_method'));

//express-session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}))

//connect-flash middleware
app.use(flash());

//Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
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

// Note Index Page
app.get('/notes', (req, res) => {
  Note.find({})
    .sort({
      date: 'desc'
    })
    .then(notes => {
      res.render('notes/index', {
        notes: notes
      });
    });
});

// Add Note Form
app.get('/notes/add', (req, res) => {
  res.render('notes/add');
});

// Edit Note Form
app.get('/notes/edit/:id', (req, res) => {
  Note.findOne({
      _id: req.params.id
    })
    .then(note => {
      res.render('notes/edit', {
        note: note
      });
    });
});

// Process Form
app.post('/notes', (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({
      text: 'Please add a title'
    });
  }
  if (!req.body.details) {
    errors.push({
      text: 'Please add some details'
    });
  }

  if (errors.length > 0) {
    res.render('notes/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Note(newUser)
      .save()
      .then(note => {
        req.flash('success_msg', 'Note added.');
        res.redirect('/notes');
      })
  }
});

//Edit Form process
app.put('/notes/:id', (req, res) => {
  Note.findOne({
      _id: req.params.id
    })
    .then(note => {
      //new values
      note.title = req.body.title;
      note.details = req.body.details;

      note.save()
        .then(note => {
          req.flash('success_msg', 'Note updated.');
          res.redirect('/notes')
        })
    });
});

//Delete Note
app.delete('/notes/:id', (req, res) => {
  Note.deleteOne({
      _id: req.params.id
    })
    .then(() => {
      req.flash('success_msg', 'Note removed.');
      res.redirect('/notes')
    })
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});