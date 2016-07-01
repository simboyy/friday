'use strict';

var _ = require('lodash');
var OrderOI = require('./orderoi.model');

// Get all orders by a user
exports.myOrders = function(req, res) {
  OrderOI.find({'uid' : req.user.email},function (err, orders) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(orders);
  });
};

// Get list of orders
exports.index = function(req, res) {
  OrderOI.find(function (err, orders) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(orders);
  });
};

// Get a single order
exports.show = function(req, res) {
  OrderOI.findById(req.params.id, function (err, order) {
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
  OrderOI.create(req.body, function(err, order) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(order);
  });
};

// Updates an existing order in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  if(req.body.__v) { delete req.body.__v; }
  req.body.uid = req.user.email; // id change on every login hence email is used
  req.body.updated = Date.now();
  OrderOI.findById(req.params.id, function (err, order) {
    if (err) { return handleError(res, err); }
    if(!order) { return res.status(404).send('Not Found'); }
    var updated = _.merge(order, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(order);
    });
  });
};

// Deletes a order from the DB.
exports.destroy = function(req, res) {
  OrderOI.findById(req.params.id, function (err, order) {
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
