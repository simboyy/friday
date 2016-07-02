'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.status(500).send(err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
  	console.log(user);
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });


	var nodemailer = require("nodemailer");

			// create reusable transporter object using the default SMTP transport 
		var transporter = nodemailer.createTransport('smtps://smkorera%40gmail.com:1994Kingsss@smtp.gmail.com');
		 
		// setup e-mail data with unicode symbols 
		var mailOptions = {
		    from: '"Ardath Online 👥" <info@aardath.com>', // sender address 
		    to: user.email, // list of receivers 
		    subject: 'Hello ✔', // Subject line 
		    text: 'Thank you for choosing Aadath.Our Goal is to provide you with the ultimate shopping experience', // plaintext body 
		    html: '<b><img src="data:image/png;base64,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"></a></b><br>Thank you for choosing Aadath.Our Goal is to provide you with the ultimate shopping experience' // html body 
		};
		 
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});

  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
