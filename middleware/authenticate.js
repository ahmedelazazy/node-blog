module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //req.flash('error', 'You need to login first.');

    return res.redirect('/users/login');
  }
  next();
};
