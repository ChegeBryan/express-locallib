var async = require('async');
var Book = require('../models/book');
var Author = require('../models/author');

// Import validation and sanitisation methods
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display list of all Authors.
exports.author_list = function (req, res) {
  Author.find()
    .populate('author')
    .sort([['family_name', 'ascending']])
    .exec(function (err, list_authors) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render('author_list', {
        title: 'Author List',
        author_list: list_authors,
      });
    });
};

// Display detail page for a specific Author.
exports.author_detail = function (req, res) {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: req.params.id }, 'title summary').exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.author == null) {
        // No results.
        var err = new Error('Author not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('author_detail', {
        title: 'Author Detail',
        author: results.author,
        author_books: results.authors_books,
      });
    }
  );
};

// Display Author create form on GET.
exports.author_create_get = function (req, res) {
  res.render('author_form', { title: 'Create author' });
};

// Handle Author create on POST.
exports.author_create_post = [
  // Validate fields
  body('first_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('First name must be specified')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .isLength({ min: 1 })
    .trim()
    .withMessage('Family name must be specified')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('date_of_death', 'Invalid date of death')
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitise fields
  sanitizeBody('first_name').escape(),
  sanitizeBody('family_name').escape(),
  sanitizeBody('date_of_birth').escape(),
  sanitizeBody('date_of_death').escape(),

  // Process request after validation and sanitisation
  (req, res, next) => {
    // extract the validation errors from a request
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // there are errors, render form again with sanitised values/error messages
      res.render('author_form', {
        title: 'Create author',
        author: res.body,
        error: errors,
      });
      return;
    } else {
      // date from form is valid

      // Create an author object with escaped and trimmed data
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
      author.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successfull - redirect to a new author record
        res.redirect(author.url);
      });
    }
  },
];

// Display Author delete form on GET.
exports.author_delete_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

// Handle Author delete on POST.
exports.author_delete_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

// Display Author update form on GET.
exports.author_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: Author update GET');
};

// Handle Author update on POST.
exports.author_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: Author update POST');
};
