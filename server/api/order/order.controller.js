'use strict';

var _ = require('lodash');
var Order = require('./order.model');

// Get all orders by a user
exports.myOrders = function(req, res) {
  Order.find({'uid' : req.user.email},function (err, orders) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(orders);
  });
};

// Get list of orders
exports.index = function(req, res) {
  Order.find(function (err, orders) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(orders);
  });
};

// Get a single order
exports.show = function(req, res) {
  Order.findById(req.params.id, function (err, order) {
    if(err) { return handleError(res, err); }
    if(!order) { return res.status(404).send('Not Found'); }
    return res.json(order);
  });
};

// Creates a new order in the DB.
exports.create = function(req, res) {
  req.body.uid = req.user.email; // id change on every login hence email is used
  var shortId = require('shortid');
  req.body.orderNo = shortId.generate();
  req.body.status = {name:"Order Placed", val:201};
  Order.create(req.body, function(err, order) {



    if(err) { return handleError(res, err); }
    var nodemailer = require("nodemailer");

			// create reusable transporter object using the default SMTP transport 
		var transporter = nodemailer.createTransport('smtps://smkorera%40gmail.com:1994Kingsss@smtp.gmail.com');
		 
		// setup e-mail data with unicode symbols 
		var mailOptions = {
		    from: '"Ardath Online 👥" <info@aardath.com>', // sender address 
		    to: 'smkorera@gmail.com', // list of receivers 
		    subject: 'New Order ✔', // Subject line 
		    text: 'Thank you for choosing Aadath.Our Goal is to provide you with the ultimate shopping experience', // plaintext body 
		    html: '<b></b><br>New Order Recieved  !'+'From'+order.name+' of'+order.address // html body 
		};

		var mailOptions2 = {
		    from: '"Ardath Online 👥" <info@aardath.com>', // sender address 
		    to: order.uid, // list of receivers 
		    subject: 'Order Successful ✔', // Subject line 
		    text: 'Thank you for Order  your order will be shipped to you ', // plaintext body 
		    html: '<b></b><br>Thank you for Ordering with Aadath  your order will be shipped to you in !'+'Order reference:'+order.orderNo // html body 
		};
		 
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});

		transporter.sendMail(mailOptions2, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});

    return res.status(201).json(order);

    
  });
};

// Updates an existing order in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.body.__v) { delete req.body.__v; }
  req.body.uid = req.user.email; // id change on every login hence email is used
  req.body.updated = Date.now();
  Order.findById(req.params.id, function (err, order) {
    if (err) { return handleError(res, err); }
    if(!order) { return res.status(404).send('Not Found'); }
    var updated = _.merge(order, req.body);
    console.log(req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(order);
    });
  });
};

// Deletes a order from the DB.
exports.destroy = function(req, res) {
  Order.findById(req.params.id, function (err, order) {
    if(err) { return handleError(res, err); }
    if(!order) { return res.status(404).send('Not Found'); }
    order.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
