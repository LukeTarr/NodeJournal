const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');


//Load Note Model
require('../models/Note');
const Note = mongoose.model('notes');

// Note Index Page
router.get('/', ensureAuthenticated, (req, res) => {
  Note.find({user: req.user.id})
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
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('notes/add');
});

// Edit Note Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Note.findOne({
      _id: req.params.id
    })
    .then(note => {
      if(note.user != req.user.id){
        req.flash('error_msg', 'Not Authorized');
        res.redirect('/notes');
      } else {
        res.render('notes/edit', {
          note: note
        });
      }
      
    });
});

// Process Form
router.post('/', ensureAuthenticated, (req, res) => {
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
      details: req.body.details,
      user: req.user.id
    };
    new Note(newUser)
      .save()
      .then(note => {
        req.flash('success_msg', 'Note added.');
        res.redirect('/notes');
      });
  }
});

//Edit Form process
router.put('/:id', ensureAuthenticated, (req, res) => {
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
          res.redirect('/notes');
        });
    });
});

//Delete Note
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Note.deleteOne({
      _id: req.params.id
    })
    .then(() => {
      req.flash('success_msg', 'Note removed.');
      res.redirect('/notes');
    });
});

module.exports = router;