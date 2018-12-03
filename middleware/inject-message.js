var expressMessages = require('express-messages');

module.exports = (req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
};
