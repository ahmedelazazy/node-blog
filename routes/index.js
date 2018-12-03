var express = require('express');
var authenticate = require('./../middleware/authenticate');
var router = express.Router();

router.get('/', authenticate, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

module.exports = router;
