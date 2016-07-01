'use strict';

var _ = require('lodash');
var Publisher= require('./publisher.model');

function isJson(str) {
  try {
      str = JSON.parse(str);
  } catch (e) {
      str = str;
  }
  return str
}

// Get all features group
exports.count = function(req, res) {
  if(req.query){
    var q = isJson(req.query.where);
    Publisher.find(q).count().exec(function (err, count) {
      if(err) { return handleError(res, err); }
      return res.status(200).json([{count:count}]);
    });
  }
};

// Get list of publishers
exports.index = function(req, res) {
  if(req.query){
    // console.log(req.query,req.query.skip,req.query.limit,req.query.sort);
    var q = isJson(req.query.where);
    // console.log(q);
    var sort = isJson(req.query.sort);
    var select = isJson(req.query.select);
    // setTimeout(function(){
      Publisher.find(q).limit(req.query.limit).skip(req.query.skip).sort(sort).select(select).exec(function (err, publishers) {
        if(err) { return handleError(res, err); }
        return res.status(200).json(publishers);
      });
    // },2000);
  }else{
    Publisher.find(function (err, publishers) {
      if(err) { return handleError(res, err); }
      return res.status(200).json(publishers);
    });
  }
};

// Get a single publisher
exports.show = function(req, res) {
  Publisher.findById(req.params.id, function (err, publisher) {
    if(err) { return handleError(res, err); }
    if(!publisher) { return res.status(404).send('Not Found'); }
    return res.json(publisher);
  });
};

// Creates a new publisher in the DB.
exports.create = function(req, res) {
  //req.body.uid = req.user.email; // id change on every login hence email is used
  req.body.updated = Date.now();
  Publisher.create(req.body, function(err, publisher) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(product);
  });
};

// Updates an existing product in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  //req.body.uid = req.user.email; // id change on every login hence email is used
  req.body.updated = Date.now();

  Publisher.findById(req.params.id, function (err, publisher) {
    if (err) { return handleError(res, err); }
    if(!publisher) { return res.status(404).send('Not Found'); }

    //mediaKit
    publisher.mediaKit = req.body.mediaKit;
    var updated = _.merge(publisher, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(publisher);
    });
  });
};

// Deletes a product from the DB.
exports.destroy = function(req, res) {
  Publisher.findById(req.params.id, function (err, publisher) {
    if(err) { return handleError(res, err); }
    if(!publisher) { return res.status(404).send('Not Found'); }
    publisher.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
