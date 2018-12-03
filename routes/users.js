var express = require('express');
var multer = require('multer');
var upload = multer({ dest: './uploads' });
const { check, validationResult } = require('express-validator/check');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('./../models/user');
var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post(
  '/login',
  passport.authenticate('local', {
    // successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: 'Incorrect email or password.'
  }),
  (req, res) => {
    req.flash('success', 'You are now logged in.');
    res.redirect('/');
  }
);
router.get('/logout', function(req, res, next) {
  req.logout();
  req.flash('success', 'You are now logged out.');
  res.redirect('/users/login');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post(
  '/register',
  upload.single('profilepicture'),
  [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    check('email')
      .not()
      .isEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is not valid'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must have at least 6 characters'),
    check('password2')
      .not()
      .isEmpty()
      .withMessage('Confirm Password is required')
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Passwords doesn't match")
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', { errors: errors.array() });
    } else {
      let profilepicture = 'default.png';

      if (req.file) {
        profilepicture = req.file.filename;
      }

      let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        profilepicture: profilepicture
      };

      User.createUser(user, (err, user) => {
        if (err) {
          throw err;
        }
        req.flash('success', 'Your registeration completed successfully. You can login now.');
        res.redirect('/users/login');
      });
    }
  }
);

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email, password, done) {
      User.findByEmail(email, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        User.validPassword(user.password, password, function(err, result) {
          if (err) throw err;
          if (!result) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user);
        });
      });
    }
  )
);

module.exports = router;
