var express = require('express');

var multer = require('multer');
var upload = multer({ dest: './uploads' });
const { check, validationResult } = require('express-validator/check');
const db = require('monk')('localhost/blog');

var authenticate = require('../middleware/authenticate');
var router = express.Router();
const Posts = db.get('posts');
const Categories = db.get('categories');

router.get('/', async (req, res, next) => {
  let posts = await Posts.find({}, { sort: { date: -1 } });
  res.render('posts', { title: 'Posts', posts: posts });
});

router.get('/post/:id', async (req, res, next) => {
  let post = await Posts.findOne({ _id: req.params.id });
  console.log(post);
  res.render('post', { title: 'Posts', post: post });
});

router.get('/category/:category', async (req, res, next) => {
  let posts = await Posts.find({ category: req.params.category }, { sort: { date: -1 } });
  res.render('posts', { title: 'Posts', posts: posts });
});

router.get('/author/:author', async (req, res, next) => {
  let posts = await Posts.find({ author: req.params.author }, { sort: { date: -1 } });
  res.render('posts', { title: 'Posts', posts: posts });
});

router.get('/addpost', authenticate, async (req, res, next) => {
  let categories = await Categories.find({});

  res.render('addpost', { title: 'Add Post', categories });
});

router.post(
  '/addpost',
  authenticate,
  upload.single('postimage'),
  [
    check('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    check('body')
      .not()
      .isEmpty()
      .withMessage('Body is required'),
    check('category')
      .not()
      .isEmpty()
      .withMessage('Category is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('addpost', { errors: errors.array() });
      } else {
        let postimage = 'default-image.png';

        if (req.file) {
          postimage = req.file.filename;
        }

        let post = {
          title: req.body.title,
          category: req.body.category,
          author: req.user.name,
          body: req.body.body,
          date: new Date(),
          postimage: postimage
        };

        let result = await Posts.insert(post);
        db.close();

        req.flash('success', 'Post added successfully');
        res.redirect('/posts/');
      }
    } catch (error) {
      req.flash('error', 'Error while saving');
      res.redirect('/posts/addpost');
    }
  }
);

router.post(
  '/comment/:id',
  authenticate,
  [
    check('writer')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    check('text')
      .not()
      .isEmpty()
      .withMessage('Comment is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.redirect('/posts/post/' + req.params.id, { errors: errors.array() });
      } else {
        let comment = {
          writer: req.body.writer,
          text: req.body.text,
          date: new Date()
        };

        await Posts.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: comment } });
        db.close();

        req.flash('success', 'Comment added successfully');
        res.redirect('/posts/post/' + req.params.id);
      }
    } catch (error) {
      req.flash('error', 'Error while saving');
      res.redirect('/posts/post');
    }
  }
);

module.exports = router;
