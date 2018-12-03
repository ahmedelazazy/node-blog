var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  res.redirect('/posts');
});

module.exports = router;
