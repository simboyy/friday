'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PublisherSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  url:String,
  company:String,
  logo:String,
  timeZone:String,
  category: {_id: String, name: String, slug: String, category: String, parentCategory: String, },
  platform: {_id: String, name: String },
  audience: [{ gender : Array, income : Array, age : Array }],
  country:String,
  description: String,
  mediaKit: [{ name : String, price : Number, adSize : String, pricing:String ,maxSize : String, adFormat : Array ,status: { type: Boolean, default: true }}],
  callout:Array,
  stats: Array,
  keyFeatures: Array,
  active: { type: Boolean, default: true },
  updated: {type: Date, default: Date.now}
}, { versionKey: false });

module.exports = mongoose.model('Publisher', PublisherSchema);
