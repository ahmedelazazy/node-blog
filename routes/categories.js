var express = require('express');

const { check, validationResult } = require('express-validator/check');
const db = require('monk')('localhost/blog');
var authenticate = require('../middleware/authenticate');

var router = express.Router();
const Categories = db.get('categories');

router.get('/', authenticate, async (req, res, next) => {
  let categories = await Categories.find({});
  res.render('addcategory', { title: 'Categories', categories: categories });
});

router.post(
  '/',
  authenticate,
  [
    check('name')
      .not()
      .isEmpty()
      .withMessage('Title is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('addcategory', { errors: errors.array() });
      } else {
        let category = {
          name: req.body.name
        };

        let result = await Categories.insert(category);
        db.close();

        req.flash('success', 'Category added successfully');
        res.redirect('/posts');
      }
    } catch (error) {
      req.flash('error', 'Error while saving');
      res.redirect('/categories/');
    }
  }
);

module.exports = router;
