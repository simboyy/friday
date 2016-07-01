'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StatisticSchema = new Schema({
  key: String,
  val: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Statistic', StatisticSchema);
