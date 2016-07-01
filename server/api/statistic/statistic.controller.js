'use strict';

var _ = require('lodash');
var Statistic = require('./statistic.model');
var Product = require('../product/product.model');

// Get all statistics group
exports.group = function(req, res) {
  var async = require("async");
  var fe = [];
  // return res.status(200).json(p);
  Statistic.find().distinct('key',function(err,statistic){
  var f = {};
    async.each(statistic, function(k, callback){
      var x = {};
      x.key = k;
      x.v = [];
      // console.log(x);
        Statistic.find({key:k,active:true}).distinct('val').exec(function(err,v){
          x.v = v;
          fe.push(x);
          callback();
        });
      },
      // 3rd param is the function to call when everything's done
      function(err){
        if( err ) { return res.status(404).send('Not Found'); } else { return res.status(200).json(fe); }
      }
    );
});
};

// // Get all statistics product details
// exports.products = function(req, res) {
//   var async = require("async");
//   var p = [];
//   // return res.status(200).json(p);
//   statistic.find().select({name:1}).exec(function(err,statistic){
//     console.log(statistic);
//     // Using async library which will enable us to wait until data received from database
//     async.each(statistic, function(a, callback){
//         a = a.toObject();
//         Product.find({'statistics.key':a.name}).select({name:1,_id:1,slug:1}).exec(function(err,c){
//           a.sub_statistics = c;
//           p.push(a);
//           callback();
//         });
//       },
//       // 3rd param is the function to call when everything's done
//       function(err){
//         if( err ) { return res.status(404).send('Not Found'); } else { return res.status(200).json(p); }
//       }
//     );
// });
// };

// Get list of statistics
exports.index = function(req, res) {
  Statistic.find(function (err, statistics) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(statistics);
  });
};

// Get a single statistic
exports.show = function(req, res) {
  Statistic.findById(req.params.id, function (err, statistic) {
    if(err) { return handleError(res, err); }
    if(!statistic) { return res.status(404).send('Not Found'); }
    return res.json(statistic);
  });
};

// Creates a new statistic in the DB.
exports.create = function(req, res) {
  Statistic.create(req.body, function(err, statistic) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(statistic);
  });
};

// Updates an existing statistic in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Statistic.findById(req.params.id, function (err, statistic) {
    if (err) { return handleError(res, err); }
    if(!statistic) { return res.status(404).send('Not Found'); }
    var updated = _.merge(statistic, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(statistic);
    });
  });
};

// Deletes a statistic from the DB.
exports.destroy = function(req, res) {
  Statistic.findById(req.params.id, function (err, statistic) {
    if(err) { return handleError(res, err); }
    if(!statistic) { return res.status(404).send('Not Found'); }
    statistic.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
