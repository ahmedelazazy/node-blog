var mongoose = require('./mongoose');
var bcrypt = require('bcryptjs');

var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilepicture: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.createUser = (user, callback) => {
  try {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        user.password = hash;
        User.create(user, callback);
      });
    });
  } catch (err) {
    throw err;
  }
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
