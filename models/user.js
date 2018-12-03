const db = require('monk')('localhost/blog');
var bcrypt = require('bcryptjs');
const User = db.get('users');

module.exports = User;

module.exports.createUser = (user, callback) => {
  try {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        User.insert(user, callback);
      });
    });
  } catch (err) {
    throw err;
  }
};

module.exports.findById = (id, callback) => {
  User.findOne({ _id: id }, callback);
};

module.exports.findByEmail = (email, callback) => {
  User.findOne({ email }, callback);
};

module.exports.validPassword = (hash, password, callback) => {
  bcrypt.compare(password, hash, function(err, res) {
    if (err) throw err;
    callback(err, res);
  });
};
